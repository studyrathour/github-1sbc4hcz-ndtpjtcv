import React, { useEffect, useState, useRef } from 'react';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { VideoControls } from './VideoControls';
import { ChatOverlay } from './ChatOverlay';
import { DoubtOverlay } from './DoubtOverlay';
import { PollOverlay } from './PollOverlay';
import { ChatMessage, DoubtQuestion, Poll, Student } from '../../types';

interface VideoPlayerProps {
  videoUrl: string;
  onTimeUpdate?: (time: number) => void;
  // Chat props
  chatMessages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
  // Doubt props
  doubts?: DoubtQuestion[];
  onAskDoubt?: (question: string, videoTime: number) => void;
  isDoubtLoading?: boolean;
  // Poll props
  activePoll?: Poll | null;
  leaderboard?: Student[];
  onSubmitPollResponse?: (pollId: string, answer: number) => void;
  userId?: string;
  showCongratulations?: boolean;
  onCongratulationsEnd?: () => void;
  // Mode
  mode?: 'live' | 'recorded';
}

// Declare YouTube API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function VideoPlayer({ 
  videoUrl, 
  onTimeUpdate, 
  chatMessages = [],
  onSendMessage,
  doubts = [],
  onAskDoubt,
  isDoubtLoading = false,
  activePoll,
  leaderboard = [],
  onSubmitPollResponse,
  userId = '',
  showCongratulations = false,
  onCongratulationsEnd,
  mode = 'recorded'
}: VideoPlayerProps) {
  const {
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
  } = useVideoPlayer(videoUrl);

  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<'chat' | 'doubt' | 'poll' | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  
  // Double tap functionality
  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Detect mobile and orientation
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const portrait = window.innerHeight > window.innerWidth;
      setIsMobile(mobile);
      setIsPortrait(portrait);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  useEffect(() => {
    onTimeUpdate?.(currentTime);
  }, [currentTime, onTimeUpdate]);

  // Auto-hide controls after 5 seconds
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 5000);
      setControlsTimeout(timeout);
      
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [showControls, isPlaying]);

  const handleMouseMove = () => {
    if (isMobile) return; // Don't handle mouse events on mobile
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => setShowControls(false), 5000);
    setControlsTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (isMobile) return; // Don't handle mouse events on mobile
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    if (isPlaying) {
      const timeout = setTimeout(() => setShowControls(false), 5000);
      setControlsTimeout(timeout);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only handle keyboard events on desktop
    if (isMobile) return;
    
    switch (e.key) {
      case ' ':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        skipBackward();
        break;
      case 'ArrowRight':
        e.preventDefault();
        skipForward();
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        toggleMute();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
    }
  };

  // Handle mobile video clicks
  const handleVideoClick = (e: React.MouseEvent) => {
    if (!isMobile) {
      // Desktop: single click to play/pause
      togglePlay();
      return;
    }

    // Mobile: handle single tap to show/hide controls and double tap for skip
    const now = Date.now();
    
    if (now - lastClickTime < 300) {
      // Double tap - handle skip functionality
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const videoWidth = rect.width;
      const leftThird = videoWidth / 3;
      const rightThird = (videoWidth * 2) / 3;
      
      if (clickX < leftThird) {
        skipBackward();
      } else if (clickX > rightThird) {
        skipForward();
      }
    } else {
      // Single tap - show controls and start auto-hide timer
      setShowControls(true);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      if (isPlaying) {
        const timeout = setTimeout(() => setShowControls(false), 5000);
        setControlsTimeout(timeout);
      }
    }
    
    setLastClickTime(now);
  };

  const handleOverlayToggle = (overlay: 'chat' | 'doubt' | 'poll') => {
    if (activeOverlay === overlay) {
      setActiveOverlay(null);
      setIsOverlayOpen(false);
    } else {
      setActiveOverlay(overlay);
      setIsOverlayOpen(true);
    }
  };

  const handlePlaybackSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const handleVideoQualityChange = (quality: string) => {
    setVideoQuality(quality);
  };

  const renderVideo = () => {
    if (videoType === 'youtube') {
      return (
        <div 
          id="youtube-player" 
          className="w-full h-full"
          style={{ pointerEvents: 'none' }}
        />
      );
    }

    return (
      <video
        ref={videoRef as React.RefObject<HTMLVideoElement>}
        src={embedUrl}
        className="w-full h-full object-contain bg-black"
        onClick={handleVideoClick}
        crossOrigin="anonymous"
      />
    );
  };

  return (
    <div className={`w-full h-screen bg-black ${
      isMobile && isPortrait ? 'flex flex-col' : 'flex'
    }`}>
      {/* Video Container */}
      <div
        ref={containerRef}
        className={`relative bg-black overflow-hidden focus:outline-none transition-all duration-300 ${
          isFullscreen 
            ? 'w-screen h-screen' 
            : isMobile && isPortrait
              ? 'w-full h-64'
              : isOverlayOpen 
                ? 'flex-1 h-screen' 
                : 'w-full h-screen'
        }`}
        onMouseMove={!isMobile ? handleMouseMove : undefined}
        onMouseLeave={!isMobile ? handleMouseLeave : undefined}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Video Element */}
        <div className="w-full h-full bg-black">
          {renderVideo()}
        </div>

        {/* Watermark */}
        <div className="absolute top-2 left-2 pointer-events-none z-20">
          <img 
            src="/image.png" 
            alt="Watermark" 
            className="w-12 h-12 opacity-50 rounded-full object-cover border-2 border-white/20"
            style={{ 
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              aspectRatio: '1/1'
            }}
          />
        </div>

        {/* Custom Controls */}
        <VideoControls
          isVisible={showControls || !isPlaying}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          isMobile={isMobile}
          isPortrait={isPortrait}
          onPlayPause={togglePlay}
          onSkipForward={skipForward}
          onSkipBackward={skipBackward}
          onSeek={seek}
          onVolumeChange={changeVolume}
          onMute={toggleMute}
          onFullscreen={toggleFullscreen}
          onChatToggle={() => handleOverlayToggle('chat')}
          onDoubtToggle={() => handleOverlayToggle('doubt')}
          onPollToggle={() => handleOverlayToggle('poll')}
          isChatActive={activeOverlay === 'chat'}
          isDoubtActive={activeOverlay === 'doubt'}
          isPollActive={activeOverlay === 'poll'}
          mode={mode}
          chatCount={chatMessages.length}
          doubtCount={doubts.length}
          hasActivePoll={!!activePoll}
          onPlaybackSpeedChange={handlePlaybackSpeedChange}
          onVideoQualityChange={handleVideoQualityChange}
          videoType={videoType}
          videoUrl={videoUrl}
        />

        {/* Click overlay for YouTube videos */}
        {videoType === 'youtube' && (
          <div 
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={handleVideoClick}
            style={{ background: 'transparent' }}
          />
        )}
      </div>

      {/* Side Overlays - Available in fullscreen too */}
      {isOverlayOpen && (
        <div className={`bg-gray-900 ${
          isFullscreen
            ? 'fixed top-0 right-0 w-80 h-screen z-50 border-l border-gray-700'
            : isMobile && isPortrait
              ? 'w-full flex-1 border-t border-gray-700'
              : 'w-80 h-screen border-l border-gray-700'
        }`}>
          {/* Chat Overlay - Only in live mode */}
          {activeOverlay === 'chat' && mode === 'live' && (
            <ChatOverlay
              messages={chatMessages}
              onSendMessage={onSendMessage || (() => {})}
              onClose={() => {
                setActiveOverlay(null);
                setIsOverlayOpen(false);
              }}
            />
          )}

          {/* Doubt Overlay - Available in both modes */}
          {activeOverlay === 'doubt' && (
            <DoubtOverlay
              doubts={doubts}
              onAskDoubt={onAskDoubt || (() => {})}
              currentVideoTime={currentTime}
              isLoading={isDoubtLoading}
              onClose={() => {
                setActiveOverlay(null);
                setIsOverlayOpen(false);
              }}
            />
          )}

          {/* Poll Overlay - Only in live mode */}
          {activeOverlay === 'poll' && mode === 'live' && (
            <PollOverlay
              activePoll={activePoll}
              leaderboard={leaderboard}
              onSubmitPollResponse={onSubmitPollResponse || (() => {})}
              userId={userId}
              showCongratulations={showCongratulations}
              onCongratulationsEnd={onCongratulationsEnd || (() => {})}
              onClose={() => {
                setActiveOverlay(null);
                setIsOverlayOpen(false);
              }}
            />
          )}
        </div>
      )}

      {/* Fullscreen overlay backdrop */}
      {isFullscreen && isOverlayOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            setActiveOverlay(null);
            setIsOverlayOpen(false);
          }}
        />
      )}
    </div>
  );
}
