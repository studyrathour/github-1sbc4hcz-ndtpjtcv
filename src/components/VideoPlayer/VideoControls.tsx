import React, { useState } from 'react';
import { formatTime } from '../../utils/videoUtils';
import { VideoType } from '../../types';
import { Download, Star, Flag } from 'lucide-react';

interface VideoControlsProps {
  isVisible: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isMobile?: boolean;
  isPortrait?: boolean;
  onPlayPause: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMute: () => void;
  onFullscreen: () => void;
  onChatToggle: () => void;
  onDoubtToggle: () => void;
  onPollToggle: () => void;
  isChatActive: boolean;
  isDoubtActive: boolean;
  isPollActive: boolean;
  mode: 'live' | 'recorded';
  chatCount: number;
  doubtCount: number;
  hasActivePoll: boolean;
  onPlaybackSpeedChange: (speed: number) => void;
  onVideoQualityChange: (quality: string) => void;
  videoType: VideoType;
  videoUrl: string;
}

export function VideoControls({
  isVisible,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  isMobile = false,
  isPortrait = false,
  onPlayPause,
  onSkipForward,
  onSkipBackward,
  onSeek,
  onVolumeChange,
  onMute,
  onFullscreen,
  onChatToggle,
  onDoubtToggle,
  onPollToggle,
  isChatActive,
  isDoubtActive,
  isPollActive,
  mode,
  chatCount,
  doubtCount,
  hasActivePoll,
  onPlaybackSpeedChange,
  onVideoQualityChange,
  videoType,
  videoUrl,
}: VideoControlsProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showThreeDotMenu, setShowThreeDotMenu] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [notes, setNotes] = useState<Array<{id: string, time: number, note: string}>>([]);
  const [newNote, setNewNote] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoQuality, setVideoQuality] = useState('720p');

  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = (parseFloat(e.target.value) / 100) * duration;
    onSeek(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    onVolumeChange(newVolume);
  };

  const handleSoundClick = () => {
    if (volume === 0 || isMuted) {
      onMute();
    }
    setShowVolumeSlider(!showVolumeSlider);
  };

  const handleThreeDotClick = () => {
    setShowThreeDotMenu(!showThreeDotMenu);
  };

  const handleRatingClick = () => {
    setShowRating(true);
    setShowThreeDotMenu(false);
  };

  const handleReportClick = () => {
    window.open('https://t.me/surajEduMaster', '_blank');
    setShowThreeDotMenu(false);
  };

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now().toString(),
        time: currentTime,
        note: newNote.trim()
      };
      setNotes([...notes, note]);
      setNewNote('');
    }
  };

  const handleNotesToggle = () => {
    setShowNotes(!showNotes);
  };

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    onPlaybackSpeedChange(speed);
    setShowSettings(false);
  };

  const handleQualityChange = (quality: string) => {
    setVideoQuality(quality);
    onVideoQualityChange(quality);
    setShowSettings(false);
  };

  const handleStartDownload = (quality: string) => {
    const downloaderPrefix = 'https://downloader-izi3-alphaproject.netlify.app/';
    
    const qualityMap: { [key: string]: string } = {
      '720p': '4',
      '480p': '3',
      '360p': '2',
      '240p': '1',
    };
    const qualityIndex = qualityMap[quality];
    if (!qualityIndex) return;
  
    const downloadUrl = videoUrl.replace(/index_(\d+)\.m3u8/, `index_${qualityIndex}.m3u8`);
    
    const finalUrl = `${downloaderPrefix}${encodeURIComponent(downloadUrl)}`;
    
    window.open(finalUrl, '_blank');
    setShowDownloadModal(false);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  const m3u8Qualities = ['720p', '480p', '360p', '240p'];
  const youtubeQualities = ['auto', '720p', '480p', '360p', '240p'];
  const qualityOptions = videoType === 'm3u8' ? m3u8Qualities : youtubeQualities;

  const MobileCenterControls = () => {
    if (!isMobile) return null;

    return (
      <div 
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-center space-x-8 pointer-events-auto">
          <button
            onClick={onSkipBackward}
            className="bg-black/50 hover:bg-black/70 rounded-full p-4 transition-all duration-200 hover:scale-110"
            title="Skip backward 10s"
          >
            <img src="/icons/10sec-backward.svg" alt="Backward" className="w-10 h-10 text-white" />
          </button>

          <button
            onClick={onPlayPause}
            className="bg-black/50 hover:bg-black/70 rounded-full p-6 transition-all duration-200 hover:scale-110"
          >
            {isPlaying 
              ? <img src="/icons/pause.svg" alt="Pause" className="w-12 h-12 text-white" /> 
              : <img src="/icons/play.svg" alt="Play" className="w-12 h-12 text-white" />}
          </button>

          <button
            onClick={onSkipForward}
            className="bg-black/50 hover:bg-black/70 rounded-full p-4 transition-all duration-200 hover:scale-110"
            title="Skip forward 10s"
          >
            <img src="/icons/10%20sec-forward.svg" alt="Forward" className="w-10 h-10 text-white" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <MobileCenterControls />

      <div 
        className={`absolute top-0 right-0 transition-opacity duration-300 ${
          isMobile ? 'p-2' : 'p-3'
        } ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
          {mode === 'live' && (
            <button
              onClick={onPollToggle}
              className={`relative rounded-full transition-all duration-200 hover:scale-110 hover:bg-white/20 text-white ${
                isMobile ? 'p-1.5' : 'p-2'
              } ${ isPollActive ? 'bg-purple-600' : 'bg-black/30' }`}
              title="View Polls"
            >
              <img src="/icons/Poll.svg" alt="Polls" className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
              {hasActivePoll && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-2 h-2 animate-pulse"></span>
              )}
            </button>
          )}

          <button
            onClick={handleThreeDotClick}
            className={`hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 text-white bg-black/30 ${
              isMobile ? 'p-1.5' : 'p-2'
            }`}
            title="More options"
          >
            <img src="/icons/three%20dot.svg" alt="More" className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
          </button>
        </div>
      </div>

      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 ${
          isMobile ? 'p-2' : 'p-3'
        } ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className={`text-gray-300 font-mono mb-2 px-2 ${
          isMobile ? 'text-xs' : 'text-xs'
        }`}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <div className="mb-4 px-2">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            onChange={handleSeekChange}
            className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer progress-slider"
            style={{
              background: `linear-gradient(to right, #6D28D9 0%, #6D28D9 ${progressPercentage}%, #374151 ${progressPercentage}%, #374151 100%)`
            }}
          />
        </div>

        <div className={`flex items-center justify-between text-white px-2 ${
          isMobile && isPortrait ? 'flex-wrap gap-2' : ''
        }`}>
          <div className={`flex items-center ${
            isMobile ? 'space-x-2' : 'space-x-3'
          }`}>
            {!isMobile && (
              <button
                onClick={onPlayPause}
                className="hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 p-2"
              >
                {isPlaying 
                  ? <img src="/icons/pause.svg" alt="Pause" className="w-8 h-8" /> 
                  : <img src="/icons/play.svg" alt="Play" className="w-8 h-8" />}
              </button>
            )}

            {!isMobile && (
              <>
                <button
                  onClick={onSkipBackward}
                  className="hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 p-1.5"
                  title="Skip backward 10s"
                >
                  <img src="/icons/10sec-backward.svg" alt="Backward" className="w-8 h-8" />
                </button>
                <button
                  onClick={onSkipForward}
                  className="hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 p-1.5"
                  title="Skip forward 10s"
                >
                  <img src="/icons/10%20sec-forward.svg" alt="Forward" className="w-8 h-8" />
                </button>
              </>
            )}

            <div className={`relative flex items-center space-x-1 ${
              isMobile ? 'ml-1' : 'ml-2'
            }`}>
              <button
                onClick={handleSoundClick}
                className={`hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 text-gray-300 ${
                  isMobile ? 'p-1' : 'p-1.5'
                }`}
              >
                {isMuted || volume === 0 
                  ? <img src="/icons/no%20sound.svg" alt="Unmute" className={isMobile ? 'w-6 h-6' : 'w-8 h-8'} /> 
                  : <img src="/icons/sound.svg" alt="Mute" className={isMobile ? 'w-6 h-6' : 'w-8 h-8'} />}
              </button>
              {showVolumeSlider && !isMobile && (
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume * 100}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer volume-slider"
                />
              )}
            </div>
          </div>

          <div className={`flex items-center ${
            isMobile ? 'space-x-1' : 'space-x-3'
          }`}>
            <div className="flex items-center space-x-1">
              {mode === 'live' && (
                <button
                  onClick={onChatToggle}
                  className={`relative rounded-full transition-all duration-200 hover:scale-110 hover:bg-white/20 ${
                    isMobile ? 'p-1' : 'p-1.5'
                  } ${ isChatActive ? 'text-white bg-purple-600' : 'text-gray-300' }`}
                  title="Toggle Chat"
                >
                  <img src="/icons/chat.svg" alt="Chat" className={isMobile ? 'w-6 h-6' : 'w-8 h-8'} />
                </button>
              )}

              <button
                onClick={onDoubtToggle}
                className={`relative rounded-full transition-all duration-200 hover:scale-110 hover:bg-white/20 ${
                  isMobile ? 'p-1' : 'p-1.5'
                } ${ isDoubtActive ? 'text-white bg-purple-600' : 'text-gray-300' }`}
                title="Ask Doubt"
              >
                <img src="/icons/Doubt.svg" alt="Doubt" className={isMobile ? 'w-6 h-6' : 'w-8 h-8'} />
              </button>
            </div>

            <button
              onClick={handleNotesToggle}
              className={`hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 text-gray-300 ${
                isMobile ? 'p-1' : 'p-1.5'
              }`}
              title="Notes"
            >
              <img src="/icons/note.svg" alt="Notes" className={isMobile ? 'w-6 h-6' : 'w-8 h-8'} />
            </button>

            <button
              onClick={handleSettingsToggle}
              className={`hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 text-gray-300 ${
                isMobile ? 'p-1' : 'p-1.5'
              }`}
              title="Settings"
            >
              <img src="/icons/setting.svg" alt="Settings" className={isMobile ? 'w-6 h-6' : 'w-8 h-8'} />
            </button>

            <button
              onClick={onFullscreen}
              className={`hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 text-gray-300 ${
                isMobile ? 'p-1 ml-0.5' : 'p-1.5 ml-1'
              }`}
            >
              {isFullscreen 
                ? <img src="/icons/exit%20full%20screen.svg" alt="Exit Fullscreen" className={isMobile ? 'w-6 h-6' : 'w-8 h-8'} /> 
                : <img src="/icons/full%20screen.svg" alt="Fullscreen" className={isMobile ? 'w-6 h-6' : 'w-8 h-8'} />}
            </button>
          </div>
        </div>
      </div>

      {showThreeDotMenu && (
        <div className={`absolute bg-gray-800 rounded-lg shadow-lg p-2 z-50 ${
          isMobile ? 'bottom-10 right-2' : 'bottom-12 right-4'
        }`}>
          {videoType === 'm3u8' && (
            <button
              onClick={() => {
                setShowDownloadModal(true);
                setShowThreeDotMenu(false);
              }}
              className={`flex items-center space-x-2 w-full text-left text-white hover:bg-gray-700 rounded ${
                isMobile ? 'p-1.5 text-xs' : 'p-2 text-sm'
              }`}
            >
              <Download className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
              <span>Download</span>
            </button>
          )}
          <button
            onClick={handleRatingClick}
            className={`flex items-center space-x-2 w-full text-white hover:bg-gray-700 rounded ${
              isMobile ? 'p-1.5 text-xs' : 'p-2 text-sm'
            }`}
          >
            <img src="/icons/Rating.svg" alt="Rating" className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
            <span className="ml-2">Rating</span>
          </button>
          <button
            onClick={handleReportClick}
            className={`flex items-center space-x-2 w-full text-white hover:bg-gray-700 rounded ${
              isMobile ? 'p-1.5 text-xs' : 'p-2 text-sm'
            }`}
          >
            <img src="/icons/Report%20player.svg" alt="Report" className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
            <span className="ml-2">Report</span>
          </button>
        </div>
      )}

      {showDownloadModal && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 text-white rounded-lg p-6 max-w-sm w-full flex flex-col max-h-[90vh]">
            <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Download Video</h3>
            <p className="text-sm text-gray-400 mb-4 flex-shrink-0">Select quality to download:</p>
            <div className="space-y-2 overflow-y-auto pr-2">
              {m3u8Qualities.map(q => (
                <button
                  key={q}
                  onClick={() => handleStartDownload(q)}
                  className="w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDownloadModal(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors flex-shrink-0"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showRating && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Rate this video</h3>
            <div className="flex justify-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="text-2xl transition-colors"
                >
                  <span className={`${
                    star <= (hoveredStar || rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowRating(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRating(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotes && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Notes</h3>
              <button
                onClick={() => setShowNotes(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {notes.map((note) => (
                <div key={note.id} className="bg-gray-50 p-3 rounded border">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm text-blue-600 font-medium">
                      {formatTime(note.time)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{note.note}</p>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">📝</div>
                  <p className="text-gray-500 text-sm">Add Some Notes!</p>
                  <p className="text-gray-400 text-xs">Click on Add Note button to start taking text and audio notes!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className={`absolute bg-gray-800 rounded-lg shadow-lg z-50 ${
          isMobile 
            ? 'bottom-10 right-2 p-3 min-w-40' 
            : 'bottom-12 right-4 p-4 min-w-48'
        }`}>
          <div className="space-y-4">
            <div>
              <label className={`text-white font-medium block mb-2 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>Speed</label>
              <select
                value={playbackSpeed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className={`w-full bg-gray-700 text-white rounded ${
                  isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
                }`}
              >
                <option value={0.25}>0.25x</option>
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
            <div>
              <label className={`text-white font-medium block mb-2 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>Quality</label>
              <select
                value={videoQuality}
                onChange={(e) => handleQualityChange(e.target.value)}
                className={`w-full bg-gray-700 text-white rounded ${
                  isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
                }`}
              >
                {qualityOptions.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className={`w-full bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${
                isMobile ? 'px-2 py-1 text-xs mt-2' : 'px-3 py-2 text-sm mt-3'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
