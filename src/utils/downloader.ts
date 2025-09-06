import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let isLoading = false;
const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

/**
 * Terminates the current FFmpeg instance to allow for a clean restart.
 */
const terminateFFmpeg = async () => {
    if (ffmpeg && ffmpeg.loaded) {
        try {
            await ffmpeg.terminate();
        } catch (e) {
            console.error("Failed to terminate FFmpeg instance:", e);
        }
    }
    ffmpeg = null;
    isLoading = false;
};


/**
 * Loads and initializes the FFmpeg instance.
 * Caches the instance for performance but can be reset if it fails.
 */
export const loadFFmpeg = async (progressCallback: (message: string) => void): Promise<FFmpeg> => {
  if (ffmpeg && ffmpeg.loaded) {
    progressCallback('Converter is ready.');
    return ffmpeg;
  }
  
  if (isLoading) {
    progressCallback('Waiting for converter to initialize...');
    await new Promise(resolve => {
      const interval = setInterval(() => {
        if (!isLoading) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });
    return loadFFmpeg(progressCallback);
  }

  isLoading = true;
  ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log("FFmpeg Log:", message);
  });

  progressCallback('Initializing converter (this may take a moment)...');
  try {
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    progressCallback('Converter initialized.');
  } catch (error) {
    console.error("Error loading FFmpeg:", error);
    await terminateFFmpeg();
    throw new Error("Could not load converter. Please check your network connection.");
  } finally {
    isLoading = false;
  }
  
  return ffmpeg;
};

/**
 * Downloads an HLS stream and converts it to an MP4 file.
 * This version fetches the manifest first and provides it as a file to FFmpeg for increased reliability.
 */
export const downloadHlsAsMp4 = async (
  m3u8Url: string,
  fileName: string,
  progressCallback: (message:string, isError?: boolean, progress?: number) => void
) => {
  let ffmpegInstance: FFmpeg;
  let logCallback: ({ message }: { message: string; }) => void;
  const virtualManifestName = 'playlist.m3u8';

  try {
    ffmpegInstance = await loadFFmpeg((msg) => progressCallback(msg, false, 0));

    // Proactively clean up virtual files from any previous runs
    try {
      const files = await ffmpegInstance.listDir('.');
      if (files.find(f => f.name === fileName)) {
        await ffmpegInstance.deleteFile(fileName);
      }
      if (files.find(f => f.name === virtualManifestName)) {
        await ffmpegInstance.deleteFile(virtualManifestName);
      }
    } catch (e) {
        console.warn("Pre-emptive file cleanup failed, continuing anyway.", e);
    }

    progressCallback('Fetching video information...', false, 0);
    const response = await fetch(m3u8Url);
    if (!response.ok) {
      throw new Error(`Failed to fetch M3U8 manifest: ${response.statusText}`);
    }
    const manifest = await response.text();
    
    // Write the manifest to the virtual file system. This is more reliable than passing a URL.
    await ffmpegInstance.writeFile(virtualManifestName, manifest);

    const totalSegments = (manifest.match(/\.ts/g) || []).length;
    let processedSegments = 0;

    if (totalSegments === 0) {
      progressCallback('Could not determine video segments. Progress may not be shown accurately.', false);
    }

    logCallback = ({ message }) => {
      // Improved regex to track progress by watching for segment downloads.
      if (/Opening 'https?:\/\/[^']+\.ts' for reading/.exec(message)) {
        processedSegments++;
        if (totalSegments > 0) {
          const progress = Math.round((processedSegments / totalSegments) * 100);
          progressCallback(`Converting segment ${processedSegments} of ${totalSegments}...`, false, Math.min(progress, 99));
        }
      }
    };
    ffmpegInstance.on('log', logCallback);

    progressCallback('Starting download and conversion...', false, 1);
    
    await ffmpegInstance.exec([
      '-reconnect', '1',
      '-reconnect_streamed', '1',
      '-reconnect_delay_max', '5',
      '-protocol_whitelist', 'file,http,https,tcp,tls,crypto',
      '-i', virtualManifestName, // Use the manifest file from the virtual FS
      '-c', 'copy', 
      '-bsf:a', 'aac_adtstoasc',
      fileName
    ]);
    
    progressCallback('Finalizing file...', false, 100);
    const data = await ffmpegInstance.readFile(fileName);
    
    const blob = new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    progressCallback('Download started successfully!', false, 100);
    
  } catch (error) {
    console.error('Error during HLS download/conversion:', error);
    const errorMessage = `Error: Conversion failed. This can happen due to server restrictions or an unsupported format. Please try again.`;
    progressCallback(errorMessage, true);
    
    await terminateFFmpeg();
    
    throw error;
  } finally {
    if (ffmpegInstance! && logCallback!) {
        ffmpegInstance.off('log', logCallback);
    }
    // Final cleanup of virtual files
    try {
      if (ffmpegInstance! && ffmpegInstance.loaded) {
        const files = await ffmpegInstance.listDir('.');
        if (files.find(f => f.name === fileName)) {
            await ffmpegInstance.deleteFile(fileName);
        }
        if (files.find(f => f.name === virtualManifestName)) {
            await ffmpegInstance.deleteFile(virtualManifestName);
        }
      }
    } catch (e) {
      console.warn('Could not clean up virtual file after operation.', e);
    }
  }
};
