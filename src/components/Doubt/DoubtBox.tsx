import React, { useState } from 'react';
import { HelpCircle, Camera, Send, Loader } from 'lucide-react';
import { DoubtQuestion } from '../../types';

interface DoubtBoxProps {
  doubts: DoubtQuestion[];
  onAskDoubt: (question: string, videoFrame: string, videoTime: number) => void;
  onCaptureFrame: () => string;
  currentVideoTime: number;
  isLoading?: boolean;
}

export function DoubtBox({ doubts, onAskDoubt, onCaptureFrame, currentVideoTime, isLoading }: DoubtBoxProps) {
  const [newQuestion, setNewQuestion] = useState('');
  const [capturedFrame, setCapturedFrame] = useState<string>('');

  const handleCaptureFrame = () => {
    const frame = onCaptureFrame();
    setCapturedFrame(frame);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestion.trim()) {
      const frame = capturedFrame || onCaptureFrame();
      onAskDoubt(newQuestion.trim(), frame, currentVideoTime);
      setNewQuestion('');
      setCapturedFrame('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 h-96 flex flex-col">
      <div className="flex items-center space-x-2 mb-3">
        <HelpCircle className="text-purple-600" size={20} />
        <h3 className="text-gray-800 font-semibold">Doubt box</h3>
        <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs">
          AI Powered
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2">
        {doubts.map((doubt) => (
          <div key={doubt.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-600 font-semibold text-sm">
                {doubt.username}
              </span>
              <span className="text-gray-500 text-xs">
                {new Date(doubt.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-gray-700 text-sm mb-2">{doubt.question}</p>
            {doubt.videoFrame && (
              <img 
                src={doubt.videoFrame} 
                alt="Video frame" 
                className="w-full h-20 object-cover rounded mb-2 border border-gray-300"
              />
            )}
            {doubt.aiResponse && (
              <div className="bg-purple-50 border border-purple-200 rounded p-2">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-purple-700 text-xs font-bold">🤖 AI Response:</span>
                </div>
                <p className="text-purple-800 text-sm">{doubt.aiResponse}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        {capturedFrame && (
          <div className="relative">
            <img 
              src={capturedFrame} 
              alt="Captured frame" 
              className="w-full h-20 object-cover rounded border border-gray-300"
            />
            <button
              type="button"
              onClick={() => setCapturedFrame('')}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleCaptureFrame}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors border border-gray-300"
            title="Capture current video frame"
          >
            <Camera size={16} />
          </button>
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask your doubt..."
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={isLoading || !newQuestion.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader className="animate-spin" size={16} /> : <Send size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
}