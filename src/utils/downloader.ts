import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let isLoading = false; // Flag to prevent concurrent loading
const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

// This function loads FFmpeg and caches the instance for reuse.
export const loadFFmpeg = async (progressCallback: (message: string) => void): Promise<FFmpeg> => {
  // If the instance is already loaded and ready, return it immediately.
  if (ffmpeg && ffmpeg.loaded) {
    progressCallback('Converter is ready.');
    return ffmpeg;
  }
  
  // If it's already in the process of loading, notify the user and wait.
  if (isLoading) {
    progressCallback('Waiting for converter to initialize...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return loadFFmpeg(progressCallback);
  }

  isLoading = true;
  ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    // Log all FFmpeg messages to the console for easier debugging.
    console.log("FFmpeg Log:", message);
  });

  ffmpeg.on('progress', ({ progress }) => {
    // Update the user on the conversion progress.
    if (progress > 0 && progress <= 1) {
      progressCallback(`Converting: ${Math.round(progress * 100)}%`);
    }
  });

  progressCallback('Initializing converter for the first time (this may take a moment)...');
  try {
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    progressCallback('Converter initialized.');
  } catch (error) {
    console.error("Error loading FFmpeg:", error);
    ffmpeg = null; // Reset on failure to allow a retry.
    throw new Error("Could not load converter. Please check your network connection.");
  } finally {
    isLoading = false;
  }
  
  return ffmpeg;
};

export const downloadHlsAsMp4 = async (
  m3u8Url: string,
  fileName: string,
  progressCallback: (message: string, isError?: boolean) => void
) => {
  let ffmpegInstance: FFmpeg;
  try {
    ffmpegInstance = await loadFFmpeg((msg) => progressCallback(msg, false));
  } catch (error) {
    progressCallback((error as Error).message, true);
    return;
  }

  try {
    progressCallback('Starting download and conversion...');
    
    // Execute the FFmpeg command to convert the HLS stream to MP4.
    // The -bsf:a filter is crucial for making the audio compatible with the MP4 container.
    await ffmpegInstance.exec([
      '-i', m3u8Url, 
      '-c', 'copy', 
      '-bsf:a', 'aac_adtstoasc',
      fileName
    ]);
    
    progressCallback('Finalizing file...');
    const data = await ffmpegInstance.readFile(fileName);
    
    const blob = new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and click it to trigger the browser's download prompt.
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    progressCallback('Download started!');
    
  } catch (error) {
    console.error('Error during HLS download/conversion:', error);
    const errorMessage = `Error: Conversion failed. This often happens due to server restrictions (CORS) on the video host. Please try a different video source. Check the browser console (F12) for detailed FFmpeg logs.`;
    progressCallback(errorMessage, true);
    throw error;
  } finally {
    // Always clean up the created file from FFmpeg's virtual file system to free up memory.
    try {
      if ((await ffmpegInstance.listDir('.')).find(f => f.name === fileName)) {
        await ffmpegInstance.deleteFile(fileName);
      }
    } catch (e) {
      console.warn('Could not clean up virtual file after operation.', e);
    }
  }
};
