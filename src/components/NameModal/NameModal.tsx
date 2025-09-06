import React, { useState } from 'react';
import { User, Save } from 'lucide-react';

interface NameModalProps {
  isOpen: boolean;
  onSubmit: (name: string) => void;
  initialName?: string;
}

export function NameModal({ isOpen, onSubmit, initialName = '' }: NameModalProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }
    
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }
    
    if (trimmedName.length > 20) {
      setError('Name must be less than 20 characters');
      return;
    }
    
    setError('');
    onSubmit(trimmedName);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <User className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to EduMaster</h2>
          <p className="text-gray-600">Please enter your name to join the session</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              maxLength={20}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Save size={20} />
            <span>Join Session</span>
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Your name will be saved for future sessions
          </p>
        </div>
      </div>
    </div>
  );
}
