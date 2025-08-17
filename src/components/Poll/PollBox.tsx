import React, { useState, useEffect } from 'react';
import { BarChart3, Trophy, Clock } from 'lucide-react';
import { Poll, Student } from '../../types';

interface PollBoxProps {
  activePoll: Poll | null;
  leaderboard: Student[];
  onSubmitPollResponse: (pollId: string, answer: number) => void;
  userId: string;
  showCongratulations: boolean;
  onCongratulationsEnd: () => void;
  isLiveMode: boolean;
}

export function PollBox({ 
  activePoll, 
  leaderboard, 
  onSubmitPollResponse, 
  userId,
  showCongratulations,
  onCongratulationsEnd,
  isLiveMode
}: PollBoxProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(45);
  const [hasAnswered, setHasAnswered] = useState(false);

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

  if (!isLiveMode) return null;

  if (showCongratulations && leaderboard.length > 0) {
    return (
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 text-center">
        <Trophy className="mx-auto mb-4 text-yellow-200" size={48} />
        <h2 className="text-2xl font-bold text-white mb-4">🎉 Congratulations! 🎉</h2>
        <div className="space-y-2">
          {leaderboard.slice(0, 3).map((student, index) => (
            <div key={student.id} className="flex items-center justify-between bg-black bg-opacity-20 rounded px-4 py-2">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-200 font-bold">#{index + 1}</span>
                <span className="text-white font-semibold">{student.username}</span>
              </div>
              <span className="text-yellow-200 font-bold">{student.score} pts</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <BarChart3 className="text-yellow-600" size={20} />
        <h3 className="text-gray-800 font-semibold">Live Poll</h3>
        {activePoll?.isActive && (
          <div className="flex items-center space-x-1 bg-red-500 px-2 py-1 rounded-full text-xs">
            <Clock size={12} />
            <span className="text-white">{timeLeft}s</span>
          </div>
        )}
      </div>

      {activePoll ? (
        <div className="space-y-4">
          <h4 className="text-gray-800 font-semibold">{activePoll.question}</h4>
          
          {activePoll.isActive && !hasAnswered && timeLeft > 0 ? (
            <div className="space-y-2">
              {activePoll.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full p-3 text-left rounded-lg transition-colors ${
                    selectedAnswer === index 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300'
                  }`}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              ))}
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Submit Answer
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <h5 className="text-gray-600 text-sm font-semibold">Results:</h5>
              {getResults().map((result, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${result.isCorrect ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                      {String.fromCharCode(65 + index)}. {result.option} {result.isCorrect && '✓'}
                    </span>
                    <span className="text-gray-600 text-sm">{result.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
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
        <p className="text-gray-600 text-sm">No active polls</p>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="mt-6">
          <h4 className="text-gray-800 font-semibold mb-3 flex items-center space-x-2">
            <Trophy className="text-yellow-600" size={16} />
            <span>Top 10 Leaderboard</span>
          </h4>
          <div className="space-y-1">
            {leaderboard.slice(0, 10).map((student, index) => (
              <div key={student.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-bold ${index < 3 ? 'text-yellow-600' : 'text-gray-600'}`}>
                    #{index + 1}
                  </span>
                  <span className="text-gray-800 text-sm">{student.username}</span>
                </div>
                <span className="text-blue-600 text-sm font-semibold">{student.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}