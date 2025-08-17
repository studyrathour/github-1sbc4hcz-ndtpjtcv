import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoPlayer } from '../VideoPlayer/VideoPlayer';
import { NameModal } from '../NameModal/NameModal';
import { FirebaseService } from '../../services/firebaseService';
import { generateResponse } from '../../config/gemini';
import { UserStorage } from '../../utils/userStorage';
import { 
  ChatMessage, 
  Comment, 
  Poll, 
  Student, 
  DoubtQuestion, 
  VideoMode 
} from '../../types';

interface VideoRoomProps {
  mode: VideoMode;
}

export function VideoRoom({ mode }: VideoRoomProps) {
  const { '*': videoUrl } = useParams<{ '*': string }>();
  const navigate = useNavigate();
  
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [showNameModal, setShowNameModal] = useState(false); // Don't show by default
  const [currentTime, setCurrentTime] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [doubts, setDoubts] = useState<DoubtQuestion[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [leaderboard, setLeaderboard] = useState<Student[]>([]);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPollTime, setLastPollTime] = useState(0);
  const [sessionStartTime] = useState(Date.now()); // Capture when the session starts
  
  // Handle URL decoding more robustly
  const decodedVideoUrl = React.useMemo(() => {
    if (!videoUrl) return '';
    try {
      // Handle multiple levels of encoding
      let decoded = videoUrl;
      while (decoded !== decodeURIComponent(decoded)) {
        decoded = decodeURIComponent(decoded);
      }
      return decoded;
    } catch (error) {
      console.error('Error decoding video URL:', error);
      return videoUrl;
    }
  }, [videoUrl]);
  
  const roomId = `${mode}-${btoa(decodedVideoUrl || '').slice(0, 10)}`;

  // Initialize user data from localStorage
  useEffect(() => {
    const storedName = UserStorage.getUserName();
    const storedUserId = UserStorage.getUserId();
    
    setUserId(storedUserId);
    
    // Only show name modal for live mode
    if (mode === 'live') {
      if (storedName) {
        setUserName(storedName);
        setShowNameModal(false);
      } else {
        setShowNameModal(true);
      }
    } else {
      // For recorded mode, use stored name or generate anonymous name
      if (storedName) {
        setUserName(storedName);
      } else {
        const anonymousName = `Student_${Math.random().toString(36).substr(2, 5)}`;
        setUserName(anonymousName);
        UserStorage.setUserName(anonymousName);
      }
      setShowNameModal(false);
    }
  }, [mode]);

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    UserStorage.setUserName(name);
    setShowNameModal(false);
  };

  useEffect(() => {
    if (!videoUrl || showNameModal) {
      return;
    }
    
    if (!videoUrl) {
      navigate('/');
      return;
    }

    // Subscribe to real-time updates based on mode
    const unsubscribes: (() => void)[] = [];

    if (mode === 'live') {
      // Live mode: subscribe to all features
      unsubscribes.push(
        FirebaseService.subscribeToChatMessages(roomId, setChatMessages, sessionStartTime),
        FirebaseService.subscribeToPolls(roomId, (newPolls) => {
          setPolls(newPolls);
          const active = newPolls.find(poll => poll.isActive);
          setActivePoll(active || null);
        }),
        FirebaseService.subscribeToLeaderboard(roomId, (students) => {
          setLeaderboard(students);
          // Show congratulations when leaderboard updates
          if (students.length > 0) {
            setShowCongratulations(true);
          }
        })
      );
    }

    // Subscribe to doubts for both modes, but filter by user for privacy
    unsubscribes.push(
      FirebaseService.subscribeToDoubtQuestions(roomId, (allDoubts) => {
        // Only show doubts from the current user for privacy
        const userDoubts = allDoubts.filter(doubt => doubt.userId === userId);
        setDoubts(userDoubts);
      })
    );

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [roomId, videoUrl, navigate, mode, showNameModal, sessionStartTime, userId]);

  // Auto-generate polls in live mode (simulate AI detection)
  useEffect(() => {
    if (mode === 'live' && !showNameModal && currentTime > 0 && currentTime - lastPollTime >= 120 && Math.floor(currentTime) % 120 === 0) {
      generateRandomPoll();
      setLastPollTime(currentTime);
    }
  }, [currentTime, mode, lastPollTime, showNameModal]);

  const generateRandomPoll = async () => {
    const questions = [
      {
        question: "What is the main concept discussed in this segment?",
        options: ["Concept A", "Concept B", "Concept C", "Concept D"],
        correctAnswer: 1
      },
      {
        question: "Which formula was just explained?",
        options: ["E=mc²", "F=ma", "V=IR", "PV=nRT"],
        correctAnswer: 2
      },
      {
        question: "What is the key takeaway from this section?",
        options: ["Understanding theory", "Practical application", "Both A and B", "None of the above"],
        correctAnswer: 2
      }
    ];

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    const newPoll: Omit<Poll, 'id'> = {
      ...randomQuestion,
      timestamp: Date.now(),
      duration: 45,
      responses: {},
      isActive: true
    };

    await FirebaseService.addPoll(roomId, newPoll);
  };

  const handleSendChatMessage = async (message: string) => {
    if (mode !== 'live') return; // Only allow chat in live mode

    const newMessage: Omit<ChatMessage, 'id'> = {
      userId,
      username: userName,
      message,
      timestamp: Date.now() // Will be overridden by serverTimestamp in Firebase
    };

    try {
      await FirebaseService.addChatMessage(roomId, newMessage);
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
    }

    // Generate AI response if message looks like a question
    if (message.includes('?') || message.toLowerCase().includes('what') || message.toLowerCase().includes('how')) {
      try {
        const aiResponse = await generateResponse(`Answer this student question about the educational content: "${message}"`);
        const aiMessage: Omit<ChatMessage, 'id'> = {
          userId: 'ai',
          username: 'AI Assistant',
          message: aiResponse,
          timestamp: Date.now(), // Will be overridden by serverTimestamp in Firebase
          isAI: true
        };
        await FirebaseService.addChatMessage(roomId, aiMessage);
      } catch (error) {
        console.error('Error generating AI response:', error);
      }
    }
  };

  const handleAddComment = async (comment: string, videoTime: number) => {
    // Comments are not used in the current implementation
    // This function is kept for potential future use
  };

  const handleAskDoubt = async (question: string, videoTime: number) => {
    setIsLoading(true);
    
    const newDoubt: Omit<DoubtQuestion, 'id'> = {
      userId,
      username: userName,
      question,
      videoTime,
      timestamp: Date.now() // Will be overridden by serverTimestamp in Firebase
    };

    try {
      // Generate AI response
      const prompt = `
        A student is asking about educational content at timestamp ${Math.floor(videoTime / 60)}:${(videoTime % 60).toFixed(0).padStart(2, '0')}.
        Question: "${question}"
        
        Please provide a helpful educational response that addresses their question.
      `;
      
      const aiResponse = await generateResponse(prompt);
      newDoubt.aiResponse = aiResponse;
    } catch (error) {
      console.error('Error generating AI response:', error);
      newDoubt.aiResponse = 'I apologize, but I encountered an error processing your question. Please try asking again.';
    }

    await FirebaseService.addDoubtQuestion(roomId, newDoubt);
    setIsLoading(false);
  };

  const handleSubmitPollResponse = async (pollId: string, answer: number) => {
    if (mode !== 'live') return; // Only allow polls in live mode

    await FirebaseService.updatePollResponse(roomId, pollId, userId, answer);
    
    // Update student score
    const poll = polls.find(p => p.id === pollId);
    if (poll && poll.correctAnswer === answer) {
      const currentStudent = leaderboard.find(s => s.id === userId);
      const newScore = (currentStudent?.score || 0) + 10;
      const newCorrectAnswers = (currentStudent?.correctAnswers || 0) + 1;
      const newTotalQuestions = (currentStudent?.totalQuestions || 0) + 1;
      
      await FirebaseService.updateStudentScore(roomId, userId, newScore, newCorrectAnswers, newTotalQuestions);
    }
  };

  // Show name modal only for live mode
  if (showNameModal && mode === 'live') {
    return (
      <div className="min-h-screen bg-gray-900">
        <NameModal
          isOpen={showNameModal}
          onSubmit={handleNameSubmit}
          initialName={userName}
        />
      </div>
    );
  }

  if (!decodedVideoUrl) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Invalid Video URL</h1>
          <p>Please provide a valid video URL.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Full Screen Video Player */}
      <VideoPlayer
        videoUrl={decodedVideoUrl}
        onTimeUpdate={setCurrentTime}
        chatMessages={mode === 'live' ? chatMessages : []}
        onSendMessage={mode === 'live' ? handleSendChatMessage : undefined}
        doubts={doubts}
        onAskDoubt={handleAskDoubt}
        isDoubtLoading={isLoading}
        activePoll={mode === 'live' ? activePoll : null}
        leaderboard={mode === 'live' ? leaderboard : []}
        onSubmitPollResponse={mode === 'live' ? handleSubmitPollResponse : undefined}
        userId={userId}
        showCongratulations={mode === 'live' ? showCongratulations : false}
        onCongratulationsEnd={() => setShowCongratulations(false)}
        mode={mode}
      />
    </div>
  );
}