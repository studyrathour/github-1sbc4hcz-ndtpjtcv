import React, { useState, useEffect } from 'react';
import { BarChart3, Trophy, Clock, X } from 'lucide-react';
import { Poll, Student } from '../../types';

interface PollOverlayProps {
  activePoll: Poll | null;
  leaderboard: Student[];
  onSubmitPollResponse: (pollId: string, answer: number) => void;
  userId: string;
  showCongratulations: boolean;
  onCongratulationsEnd: () => void;
  onClose: () => void;
}

export function PollOverlay({ 
  activePoll, 
  leaderboard, 
  onSubmitPollResponse, 
  userId,
  showCongratulations,
  onCongratulationsEnd,
  onClose
}: PollOverlayProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(45);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (activePoll && activePoll.isActive && !hasAnswered) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [activePoll, hasAnswered]);

  useEffect(() => {
    if (activePoll && userId in activePoll.responses) {
      setHasAnswered(true);
      setSelectedAnswer(activePoll.responses[userId]);
    } else {
      setHasAnswered(false);
      setSelectedAnswer(null);
      setTimeLeft(45);
    }
  }, [activePoll, userId]);

  useEffect(() => {
    if (showCongratulations) {
      const timer = setTimeout(() => {
        onCongratulationsEnd();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCongratulations, onCongratulationsEnd]);

  const handleSubmitAnswer = () => {
    if (activePoll && selectedAnswer !== null && !hasAnswered) {
      onSubmitPollResponse(activePoll.id, selectedAnswer);
      setHasAnswered(true);
    }
  };

  const getResults = () => {
    if (!activePoll) return [];
    
    const totalResponses = Object.keys(activePoll.responses).length;
    return activePoll.options.map((option, index) => {
      const count = Object.values(activePoll.responses).filter(answer => answer === index).length;
      const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
      return { option, count, percentage, isCorrect: index === activePoll.correctAnswer };
    });
  };

  if (showCongratulations && leaderboard.length > 0) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-yellow-600 to-orange-600 flex flex-col items-center justify-center text-center ${
        isMobile ? 'p-4' : 'p-6'
      }`}>
        <button
          onClick={onClose}
          className={`absolute text-yellow-200 hover:text-white rounded-full transition-colors ${
            isMobile ? 'top-2 right-2 p-1' : 'top-4 right-4 p-2'
          }`}
        >
          <X size={isMobile ? 16 : 18} />
        </button>
        <Trophy className={`mb-4 text-yellow-200`} size={isMobile ? 36 : 48} />
        <h2 className={`font-bold text-white mb-4 ${
          isMobile ? 'text-lg' : 'text-2xl'
        }`}>🎉 Congratulations! 🎉</h2>
        <div className="space-y-2 w-full">
          {leaderboard.slice(0, 3).map((student, index) => (
            <div key={student.id} className={`flex items-center justify-between bg-black bg-opacity-20 rounded ${
              isMobile ? 'px-3 py-1.5' : 'px-4 py-2'
            }`}>
              <div className="flex items-center space-x-2">
                <span className={`text-yellow-200 font-bold ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}>#{index + 1}</span>
                <span className={`text-white font-semibold ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}>{student.username}</span>
              </div>
              <span className={`text-yellow-200 font-bold ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>{student.score} pts</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className={`bg-yellow-600 text-white flex items-center justify-between border-b border-yellow-700 ${
        isMobile ? 'p-2' : 'p-3'
      }`}>
        <div className="flex items-center space-x-2">
          <BarChart3 size={isMobile ? 16 : 18} />
          <h3 className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>Live Poll</h3>
          {activePoll?.isActive && (
            <div className={`flex items-center space-x-1 bg-red-500 px-2 py-1 rounded-full ${
              isMobile ? 'text-xs' : 'text-xs'
            }`}>
              <Clock size={isMobile ? 10 : 12} />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className={`hover:bg-yellow-700 rounded-full transition-colors ${
            isMobile ? 'p-0.5' : 'p-1'
          }`}
        >
          <X size={isMobile ? 16 : 18} />
        </button>
      </div>

      {/* Poll Content */}
      <div className={`flex-1 overflow-y-auto bg-gray-800 ${
        isMobile ? 'p-2' : 'p-3'
      }`}>
        {activePoll ? (
          <div className="space-y-4">
            <h4 className={`text-gray-200 font-semibold ${
              isMobile ? 'text-sm' : 'text-base'
            }`}>{activePoll.question}</h4>
            
            {activePoll.isActive && !hasAnswered && timeLeft > 0 ? (
              <div className="space-y-2">
                {activePoll.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(index)}
                    className={`w-full text-left rounded-lg transition-colors ${
                      isMobile ? 'p-2' : 'p-3'
                    } ${
                      selectedAnswer === index 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600'
                    }`}
                  >
                    <span className={isMobile ? 'text-sm' : 'text-base'}>
                      {String.fromCharCode(65 + index)}. {option}
                    </span>
                  </button>
                ))}
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className={`w-full bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 ${
                    isMobile ? 'py-1.5 text-sm' : 'py-2 text-base'
                  }`}
                >
                  Submit Answer
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <h5 className={`text-gray-300 font-semibold ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>Results:</h5>
                {getResults().map((result, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className={`${
                        isMobile ? 'text-xs' : 'text-sm'
                      } ${result.isCorrect ? 'text-green-400 font-bold' : 'text-gray-200'}`}>
                        {String.fromCharCode(65 + index)}. {result.option} {result.isCorrect && '✓'}
                      </span>
                      <span className={`text-gray-300 ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>{result.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${result.isCorrect ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${result.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className={`text-gray-400 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>No active polls</p>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="mt-6">
            <h4 className={`text-gray-200 font-semibold mb-3 flex items-center space-x-2 ${
              isMobile ? 'text-sm' : 'text-base'
            }`}>
              <Trophy className="text-yellow-600" size={isMobile ? 14 : 16} />
              <span>Top 10 Leaderboard</span>
            </h4>
            <div className="space-y-1">
              {leaderboard.slice(0, 10).map((student, index) => (
                <div key={student.id} className={`flex items-center justify-between bg-gray-700 border border-gray-600 rounded ${
                  isMobile ? 'px-2 py-1.5' : 'px-3 py-2'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${
                      isMobile ? 'text-xs' : 'text-sm'
                    } ${index < 3 ? 'text-yellow-600' : 'text-gray-600'}`}>
                      #{index + 1}
                    </span>
                    <span className={`text-gray-200 ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}>{student.username}</span>
                  </div>
                  <span className={`text-blue-600 font-semibold ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>{student.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}