export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  isAI?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  comment: string;
  timestamp: number;
  videoTime: number;
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  timestamp: number;
  duration: number;
  responses: { [userId: string]: number };
  isActive: boolean;
}

export interface Student {
  id: string;
  username: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface DoubtQuestion {
  id: string;
  userId: string;
  username: string;
  question: string;
  videoFrame: string;
  videoTime: number;
  timestamp: number;
  aiResponse?: string;
}

export type VideoMode = 'live' | 'recorded';
export type VideoType = 'youtube' | 'mp4' | 'm3u8';