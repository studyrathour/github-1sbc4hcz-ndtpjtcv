import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Users } from 'lucide-react';
import { ChatMessage } from '../../types';

interface ChatOverlayProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
}

export function ChatOverlay({ messages, onSendMessage, onClose }: ChatOverlayProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className={`bg-blue-600 text-white flex items-center justify-between border-b border-blue-700 ${
        isMobile ? 'p-2' : 'p-3'
      }`}>
        <div className="flex items-center space-x-2">
          <MessageCircle size={isMobile ? 16 : 18} />
          <h3 className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>Live Chat</h3>
          <span className={`bg-red-500 px-2 py-0.5 rounded-full font-bold ${
            isMobile ? 'text-xs' : 'text-xs'
          }`}>LIVE</span>
        </div>
        <button
          onClick={onClose}
          className={`hover:bg-blue-700 rounded-full transition-colors ${
            isMobile ? 'p-0.5' : 'p-1'
          }`}
        >
          <X size={isMobile ? 16 : 18} />
        </button>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto space-y-2 bg-gray-800 ${
        isMobile ? 'p-2' : 'p-3'
      }`}>
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-2">
            <div className={`rounded-full flex items-center justify-center text-xs font-bold text-white ${
              isMobile ? 'w-6 h-6' : 'w-8 h-8'
            } ${
              message.isAI ? 'bg-purple-500' : 'bg-blue-500'
            }`}>
              {message.isAI ? '🤖' : message.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 mb-1">
                <span className={`font-semibold ${
                  isMobile ? 'text-xs' : 'text-sm'
                } ${message.isAI ? 'text-purple-600' : 'text-gray-700'}`}>
                  {message.isAI ? 'AI Assistant' : message.username}
                </span>
                <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className={`text-gray-200 break-words ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>{message.message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`border-t border-gray-700 bg-gray-900 ${
        isMobile ? 'p-2' : 'p-3'
      }`}>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className={`flex-1 bg-gray-700 text-white rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 ${
              isMobile ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
            }`}
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isMobile ? 'px-3 py-1.5' : 'px-4 py-2'
            }`}
          >
            <Send size={isMobile ? 12 : 14} />
          </button>
        </form>
      </div>
    </div>
  );
}
