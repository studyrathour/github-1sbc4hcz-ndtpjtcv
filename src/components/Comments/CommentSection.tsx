import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import { Comment } from '../../types';
import { formatTime } from '../../utils/videoUtils';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (comment: string, videoTime: number) => void;
  currentVideoTime: number;
  isRecordedMode: boolean;
}

export function CommentSection({ comments, onAddComment, currentVideoTime, isRecordedMode }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim(), currentVideoTime);
      setNewComment('');
    }
  };

  if (!isRecordedMode) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 h-96 flex flex-col">
      <div className="flex items-center space-x-2 mb-3">
        <MessageSquare className="text-green-600" size={20} />
        <h3 className="text-gray-800 font-semibold">Comments</h3>
        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
          {comments.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-600 font-semibold text-sm">
                {comment.username}
              </span>
              <div className="flex items-center space-x-2 text-gray-500 text-xs">
                <Clock size={12} />
                <span>{formatTime(comment.videoTime)}</span>
                <span>•</span>
                <span>{new Date(comment.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
            <p className="text-gray-700 text-sm">{comment.comment}</p>
          </div>
        ))}
        <div ref={commentsEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          maxLength={300}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Comment
        </button>
      </form>
    </div>
  );
}