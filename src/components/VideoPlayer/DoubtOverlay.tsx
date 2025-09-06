import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, Loader, X } from 'lucide-react';
import { DoubtQuestion } from '../../types';

interface DoubtOverlayProps {
  doubts: DoubtQuestion[];
  onAskDoubt: (question: string, videoTime: number) => void;
  currentVideoTime: number;
  isLoading: boolean;
  onClose: () => void;
}

export function DoubtOverlay({ 
  doubts, 
  onAskDoubt, 
  currentVideoTime, 
  isLoading, 
  onClose 
}: DoubtOverlayProps) {
  const [newQuestion, setNewQuestion] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestion.trim()) {
      onAskDoubt(newQuestion.trim(), currentVideoTime);
      setNewQuestion('');
    }
  };

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className={`bg-purple-600 text-white flex items-center justify-between border-b border-purple-700 ${
        isMobile ? 'p-2' : 'p-3'
      }`}>
        <div className="flex items-center space-x-2">
          <HelpCircle size={isMobile ? 16 : 18} />
          <h3 className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>My Doubts</h3>
          <span className={`bg-purple-800 px-2 py-0.5 rounded-full font-bold ${
            isMobile ? 'text-xs' : 'text-xs'
          }`}>AI</span>
        </div>
        <button
          onClick={onClose}
          className={`hover:bg-purple-700 rounded-full transition-colors ${
            isMobile ? 'p-0.5' : 'p-1'
          }`}
        >
          <X size={isMobile ? 16 : 18} />
        </button>
      </div>

      {/* Doubts List - Only showing user's own doubts */}
      <div className={`flex-1 overflow-y-auto space-y-2 bg-gray-800 ${
        isMobile ? 'p-2' : 'p-3'
      }`}>
        {doubts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <HelpCircle className="text-gray-500 mb-4" size={48} />
            <p className="text-gray-400 mb-2">No doubts yet</p>
            <p className="text-gray-500 text-sm">Ask your first question below!</p>
          </div>
        ) : (
          doubts.map((doubt) => (
            <div key={doubt.id} className={`bg-gray-700 rounded-lg border border-gray-600 ${
              isMobile ? 'p-2' : 'p-3'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-purple-600 font-semibold ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  You
                </span>
                <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  {new Date(doubt.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className={`text-gray-200 mb-2 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>{doubt.question}</p>
              {doubt.aiResponse && (
                <div className={`bg-purple-900/30 border border-purple-500/30 rounded ${
                  isMobile ? 'p-1.5' : 'p-2'
                }`}>
                  <div className="flex items-center space-x-1 mb-1">
                    <span className={`text-purple-300 font-bold ${
                      isMobile ? 'text-xs' : 'text-xs'
                    }`}>🤖 AI Response:</span>
                  </div>
                  <p className={`text-purple-100 ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>{doubt.aiResponse}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Form */}
      <div className={`border-t border-gray-700 bg-gray-900 ${
        isMobile ? 'p-2' : 'p-3'
      }`}>
        <form onSubmit={handleSubmit} className={isMobile ? 'space-y-2' : 'space-y-3'}>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask your doubt..."
              className={`flex-1 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 ${
                isMobile ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
              }`}
              maxLength={200}
            />
            <button
              type="submit"
              disabled={isLoading || !newQuestion.trim()}
              className={`bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 ${
                isMobile ? 'px-3 py-1.5' : 'px-4 py-2'
              }`}
            >
              {isLoading ? <Loader className="animate-spin" size={isMobile ? 14 : 16} /> : <Send size={isMobile ? 14 : 16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
