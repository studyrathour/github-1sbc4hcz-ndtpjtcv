import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Radio, FileVideo, ExternalLink } from 'lucide-react';

export function Landing() {
  const [videoUrl, setVideoUrl] = useState('');
  const [mode, setMode] = useState<'live' | 'recorded'>('recorded');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoUrl.trim()) {
      // Encode the URL properly for routing
      const encodedUrl = encodeURIComponent(encodeURIComponent(videoUrl.trim()));
      navigate(`/${mode}/${encodedUrl}`);
    }
  };

  const handleQuickStart = (url: string, selectedMode: 'live' | 'recorded') => {
    // Encode the URL properly for routing
    const encodedUrl = encodeURIComponent(encodeURIComponent(url));
    navigate(`/${selectedMode}/${encodedUrl}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            EduMaster Video Player
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Advanced Educational Video Player
          </p>
          <p className="text-gray-400">
            AI-Powered Learning with Live Chat, Polls, and Smart Doubt Resolution
          </p>
        </div>

        {/* Main Form */}
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mode Selection */}
            <div className="space-y-3">
              <label className="text-white font-semibold">Select Mode:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMode('live')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    mode === 'live'
                      ? 'border-red-500 bg-red-500 bg-opacity-20 text-white'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-red-400'
                  }`}
                >
                  <Radio className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">Live Mode</div>
                  <div className="text-xs text-gray-400">
                    Real-time chat, polls, leaderboard
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setMode('recorded')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    mode === 'recorded'
                      ? 'border-green-500 bg-green-500 bg-opacity-20 text-white'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-green-400'
                  }`}
                >
                  <FileVideo className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">Recorded Mode</div>
                  <div className="text-xs text-gray-400">
                    Comments, AI doubts, playback
                  </div>
                </button>
              </div>
            </div>

            {/* Video URL Input */}
            <div className="space-y-3">
              <label htmlFor="videoUrl" className="text-white font-semibold">
                Video URL:
              </label>
              <input
                type="url"
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube, MP4, or M3U8 URL here..."
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Play size={20} />
              <span>Start Learning</span>
            </button>
          </form>
        </div>

        {/* Generate Link Section */}
        <div className="max-w-2xl mx-auto mt-8 bg-gray-800 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Generate Shareable Link</h2>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="url"
                placeholder="Enter video URL to generate link..."
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <select className="px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600">
                <option value="live">Live</option>
                <option value="recorded">Recorded</option>
              </select>
            </div>
            <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all">
              Generate Link
            </button>
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">Generated Link:</p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value="Click generate to create shareable link"
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-600 text-gray-300 rounded text-sm"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start Examples */}
        <div className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Quick Start Examples
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sample YouTube Video */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Sample Educational Content
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Try with this sample YouTube educational video
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => handleQuickStart('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'live')}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Radio size={16} />
                  <span>Try Live Mode</span>
                </button>
                <button
                  onClick={() => handleQuickStart('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'recorded')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <FileVideo size={16} />
                  <span>Try Recorded Mode</span>
                </button>
              </div>
            </div>

            {/* Features Overview */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Key Features
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>AI-powered doubt resolution with video frame analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Real-time chat and comments system</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Auto-generated polls with leaderboards</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>YouTube brand-free custom player</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* URL Format Help */}
        <div className="max-w-2xl mx-auto mt-8 bg-gray-800 bg-opacity-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">URL Format</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p><strong>Live:</strong> {window.location.origin}/live/your-video-url</p>
            <p><strong>Recorded:</strong> {window.location.origin}/rec/your-video-url</p>
          </div>
        </div>
      </div>
    </div>
  );
}
