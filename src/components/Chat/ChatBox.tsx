import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { ChatMessage } from '../../types';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLiveMode: boolean;
}

export function ChatBox({ messages, onSendMessage, isLiveMode }: ChatBoxProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  if (!isLiveMode) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 h-96 flex flex-col">
      <div className="flex items-center space-x-2 mb-3">
        <MessageCircle className="text-red-500" size={20} />
        <h3 className="text-gray-800 font-semibold">Top chat</h3>
        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">LIVE</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-2 text-sm">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              message.isAI ? 'bg-purple-500' : 'bg-blue-500'
            }`}>
              {message.isAI ? '🤖' : message.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className={`font-semibold text-sm ${message.isAI ? 'text-purple-600' : 'text-gray-700'}`}>
                  {message.isAI ? 'AI Assistant' : message.username}
                </span>
                <span className="text-gray-400 text-xs">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-800 text-sm mt-1">{message.message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={200}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
