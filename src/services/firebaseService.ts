import {
  ref,
  push,
  onValue,
  query,
  orderByChild,
  limitToLast,
  startAt,
  serverTimestamp,
  set,
  update,
  off
} from 'firebase/database';
import { db } from '../config/firebase';
import { ChatMessage, Comment, Poll, Student, DoubtQuestion } from '../types';

export class FirebaseService {
  // Chat messages
  static async addChatMessage(roomId: string, message: Omit<ChatMessage, 'id'>) {
    try {
      const chatRef = ref(db, `rooms/${roomId}/chats`);
      const newChatRef = push(chatRef);
      await set(newChatRef, {
        ...message,
        timestamp: serverTimestamp()
      });
      console.log('Chat message added:', newChatRef.key);
    } catch (error) {
      console.error('Error adding chat message:', error);
      throw error;
    }
  }

  static subscribeToChatMessages(roomId: string, callback: (messages: ChatMessage[]) => void, startTime?: number) {
    const chatRef = ref(db, `rooms/${roomId}/chats`);
    // Only get messages from the specified start time (current time when player opens)
    const chatQuery = startTime 
      ? query(chatRef, orderByChild('timestamp'), startAt(startTime))
      : query(chatRef, orderByChild('timestamp'), limitToLast(500));
    
    const unsubscribe = onValue(chatQuery, (snapshot) => {
      const messages: ChatMessage[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach((key) => {
          const messageData = {
            id: key,
            ...data[key],
            timestamp: data[key].timestamp || Date.now()
          } as ChatMessage;
          
          // If startTime is provided, only include messages after that time
          if (!startTime || messageData.timestamp >= startTime) {
            messages.push(messageData);
          }
        });
        // Sort messages by timestamp
        messages.sort((a, b) => a.timestamp - b.timestamp);
      }
      console.log('Chat messages updated:', messages.length);
      callback(messages);
    }, (error) => {
      console.error('Error subscribing to chat messages:', error);
    });

    return () => off(chatQuery);
  }

  // Comments
  static async addComment(roomId: string, comment: Omit<Comment, 'id'>) {
    try {
      const commentRef = ref(db, `rooms/${roomId}/comments`);
      const newCommentRef = push(commentRef);
      await set(newCommentRef, {
        ...comment,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }

  static subscribeToComments(roomId: string, callback: (comments: Comment[]) => void) {
    const commentRef = ref(db, `rooms/${roomId}/comments`);
    const commentQuery = query(commentRef, orderByChild('timestamp'), limitToLast(500));
    
    const unsubscribe = onValue(commentQuery, (snapshot) => {
      const comments: Comment[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach((key) => {
          comments.unshift({
            id: key,
            ...data[key],
            timestamp: data[key].timestamp || Date.now()
          } as Comment);
        });
      }
      callback(comments);
    });

    return () => off(commentQuery);
  }

  // Polls
  static async addPoll(roomId: string, poll: Omit<Poll, 'id'>) {
    try {
      const pollRef = ref(db, `rooms/${roomId}/polls`);
      const newPollRef = push(pollRef);
      await set(newPollRef, {
        ...poll,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding poll:', error);
    }
  }

  static async updatePollResponse(roomId: string, pollId: string, userId: string, answer: number) {
    try {
      const pollResponseRef = ref(db, `rooms/${roomId}/polls/${pollId}/responses/${userId}`);
      await set(pollResponseRef, answer);
    } catch (error) {
      console.error('Error updating poll response:', error);
    }
  }

  static subscribeToPolls(roomId: string, callback: (polls: Poll[]) => void) {
    const pollRef = ref(db, `rooms/${roomId}/polls`);
    const pollQuery = query(pollRef, orderByChild('timestamp'));
    
    const unsubscribe = onValue(pollQuery, (snapshot) => {
      const polls: Poll[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach((key) => {
          polls.unshift({
            id: key,
            ...data[key],
            timestamp: data[key].timestamp || Date.now(),
            responses: data[key].responses || {}
          } as Poll);
        });
      }
      callback(polls);
    });

    return () => off(pollQuery);
  }

  // Doubt questions
  static async addDoubtQuestion(roomId: string, doubt: Omit<DoubtQuestion, 'id'>) {
    try {
      const doubtRef = ref(db, `rooms/${roomId}/doubts`);
      const newDoubtRef = push(doubtRef);
      await set(newDoubtRef, {
        ...doubt,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding doubt question:', error);
    }
  }

  static subscribeToDoubtQuestions(roomId: string, callback: (doubts: DoubtQuestion[]) => void) {
    const doubtRef = ref(db, `rooms/${roomId}/doubts`);
    const doubtQuery = query(doubtRef, orderByChild('timestamp'));
    
    const unsubscribe = onValue(doubtQuery, (snapshot) => {
      const doubts: DoubtQuestion[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach((key) => {
          doubts.unshift({
            id: key,
            ...data[key],
            timestamp: data[key].timestamp || Date.now()
          } as DoubtQuestion);
        });
      }
      callback(doubts);
    });

    return () => off(doubtQuery);
  }

  // Students/Leaderboard
  static async updateStudentScore(roomId: string, studentId: string, score: number, correctAnswers: number, totalQuestions: number) {
    try {
      const studentRef = ref(db, `rooms/${roomId}/students/${studentId}`);
      await update(studentRef, {
        score,
        correctAnswers,
        totalQuestions,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating student score:', error);
    }
  }

  static subscribeToLeaderboard(roomId: string, callback: (students: Student[]) => void) {
    const studentRef = ref(db, `rooms/${roomId}/students`);
    const studentQuery = query(studentRef, orderByChild('score'), limitToLast(10));
    
    const unsubscribe = onValue(studentQuery, (snapshot) => {
      const students: Student[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach((key) => {
          students.unshift({
            id: key,
            ...data[key]
          } as Student);
        });
        // Sort by score descending since Firebase sorts ascending
        students.sort((a, b) => b.score - a.score);
      }
      callback(students);
    });

    return () => off(studentQuery);
  }
}