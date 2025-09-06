import { useState, useRef, useCallback, useEffect } from 'react';
import { VideoType } from '../types';
import { detectVideoType, extractYouTubeId, getYouTubeEmbedUrl, captureVideoFrame } from '../utils/videoUtils';
import Hls from 'hls.js';

export function useVideoPlayer(videoUrl: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1);
  const [videoQuality, setVideoQualityState] = useState('720p');
  
  const videoRef = useRef<HTMLVideoElement | HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const hlsRef = useRef<Hls | null>(null);

  const videoType: VideoType = detectVideoType(videoUrl);
  const youtubeId = videoType === 'youtube' ? extractYouTubeId(videoUrl) : null;
  const embedUrl = youtubeId ? getYouTubeEmbedUrl(youtubeId) : videoUrl;

  // Initialize YouTube API
  useEffect(() => {
    if (videoType === 'youtube' && youtubeId) {
      // Load YouTube IFrame API
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
          initializeYouTubePlayer();
        };
      } else {
        initializeYouTubePlayer();
      }
    }
  }, [videoType, youtubeId]);

  const initializeYouTubePlayer = () => {
    if (youtubePlayerRef.current || !youtubeId) return;

    youtubePlayerRef.current = new window.YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
      videoId: youtubeId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        cc_load_policy: 0,
        playsinline: 1,
        origin: window.location.origin
      },
      events: {
        onReady: (event: any) => {
          setDuration(event.target.getDuration());
          setVolume(event.target.getVolume() / 100);
          // Set initial playback speed
          event.target.setPlaybackRate(playbackSpeed);
        },
        onStateChange: (event: any) => {
          const state = event.data;
          setIsPlaying(state === window.YT.PlayerState.PLAYING);
          
          if (state === window.YT.PlayerState.PLAYING) {
            startTimeTracking();
          }
        }
      }
    });
  };

  const startTimeTracking = () => {
    const updateTime = () => {
      if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime) {
        setCurrentTime(youtubePlayerRef.current.getCurrentTime());
        if (isPlaying) {
          requestAnimationFrame(updateTime);
        }
      }
    };
    updateTime();
  };

  const play = useCallback(() => {
    if (videoType === 'youtube' && youtubePlayerRef.current) {
      youtubePlayerRef.current.playVideo();
    } else if (videoRef.current && videoRef.current instanceof HTMLVideoElement) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [videoType]);

  const pause = useCallback(() => {
    if (videoType === 'youtube' && youtubePlayerRef.current) {
      youtubePlayerRef.current.pauseVideo();
    } else if (videoRef.current && videoRef.current instanceof HTMLVideoElement) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [videoType]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (videoType === 'youtube' && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(time, true);
      setCurrentTime(time);
    } else if (videoRef.current && videoRef.current instanceof HTMLVideoElement) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [videoType]);

  const skipForward = useCallback(() => {
    const newTime = Math.min(currentTime + 10, duration);
    seek(newTime);
  }, [currentTime, duration, seek]);

  const skipBackward = useCallback(() => {
    const newTime = Math.max(currentTime - 10, 0);
    seek(newTime);
  }, [currentTime, seek]);

  const toggleMute = useCallback(() => {
    if (videoType === 'youtube' && youtubePlayerRef.current) {
      if (isMuted) {
        youtubePlayerRef.current.unMute();
      } else {
        youtubePlayerRef.current.mute();
      }
      setIsMuted(!isMuted);
    } else if (videoRef.current && videoRef.current instanceof HTMLVideoElement) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted, videoType]);

  const changeVolume = useCallback((newVolume: number) => {
    if (videoType === 'youtube' && youtubePlayerRef.current) {
      youtubePlayerRef.current.setVolume(newVolume * 100);
      setVolume(newVolume);
    } else if (videoRef.current && videoRef.current instanceof HTMLVideoElement) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  }, [videoType]);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeedState(speed);
    if (videoType === 'youtube' && youtubePlayerRef.current) {
      const availableRates = youtubePlayerRef.current.getAvailablePlaybackRates();
      if (availableRates && availableRates.includes(speed)) {
        youtubePlayerRef.current.setPlaybackRate(speed);
      }
    } else if (videoRef.current && videoRef.current instanceof HTMLVideoElement) {
      // Store current time to prevent reset
      const currentVideoTime = videoRef.current.currentTime;
      videoRef.current.playbackRate = speed;
      // Restore time position
      videoRef.current.currentTime = currentVideoTime;
    }
  }, [videoType]);

  const setVideoQuality = useCallback((quality: string) => {
    setVideoQualityState(quality);
    if (videoType === 'youtube' && youtubePlayerRef.current) {
      const qualityMap: { [key: string]: string } = {
        '720p': 'hd720',
        '480p': 'large',
        '360p': 'medium',
        '240p': 'small',
        'auto': 'default'
      };
      const ytQuality = qualityMap[quality] || 'default';
      const availableQualities = youtubePlayerRef.current.getAvailableQualityLevels();
      if (availableQualities && availableQualities.includes(ytQuality)) {
        youtubePlayerRef.current.setPlaybackQuality(ytQuality);
      }
    } else if (videoType === 'm3u8' && videoRef.current instanceof HTMLVideoElement && hlsRef.current) {
        const qualityMap: { [key: string]: string } = {
            '720p': '4',
            '480p': '3',
            '360p': '2',
            '240p': '1',
        };
        const qualityIndex = qualityMap[quality];
        if (!qualityIndex) return;

        const newUrl = videoUrl.replace(/index_(\d+)\.m3u8/, `index_${qualityIndex}.m3u8`);

        if (newUrl !== hlsRef.current.url) {
            const currentVideoTime = videoRef.current.currentTime;
            const wasPlaying = !videoRef.current.paused;
            const hls = hlsRef.current;
            
            hls.loadSource(newUrl);
            hls.once(Hls.Events.LEVEL_LOADED, () => {
                if(videoRef.current) {
                    videoRef.current.currentTime = currentVideoTime;
                    videoRef.current.playbackRate = playbackSpeed;
                    if (wasPlaying) {
                        videoRef.current.play();
                    }
                }
            });
        }
    }
  }, [videoType, videoUrl, playbackSpeed]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const captureCurrentFrame = useCallback((): string => {
    if (videoType === 'youtube') {
      // For YouTube, we'll create a canvas and draw the current frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 640;
      canvas.height = 360;
      
      if (ctx) {
        // Create a placeholder frame with video info
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('YouTube Video Frame', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText(`Time: ${Math.floor(currentTime / 60)}:${(currentTime % 60).toFixed(0).padStart(2, '0')}`, canvas.width / 2, canvas.height / 2 + 20);
      }
      
      return canvas.toDataURL('image/jpeg', 0.8);
    } else if (videoRef.current && videoRef.current instanceof HTMLVideoElement) {
      return captureVideoFrame(videoRef.current);
    }
    return '';
  }, [videoType, currentTime]);

  // Handle regular video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !(video instanceof HTMLVideoElement) || videoType === 'youtube') return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleLoadedData = () => {
      // Set playback speed after video data is loaded
      video.playbackRate = playbackSpeed;
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Setup HLS for m3u8 files
    if (videoType === 'm3u8' && Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.playbackRate = playbackSpeed;
      });
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [videoType, videoUrl, playbackSpeed]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return {
    videoRef,
    containerRef,
    videoType,
    embedUrl,
    youtubeId,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    play,
    pause,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    toggleMute,
    changeVolume,
    toggleFullscreen,
    captureCurrentFrame,
    setPlaybackSpeed,
    setVideoQuality,
  };
}
