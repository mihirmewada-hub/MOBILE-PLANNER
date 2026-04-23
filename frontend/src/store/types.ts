export type CategoryKey = 'work' | 'health' | 'study' | 'social' | 'creative';
export type Priority = 'high' | 'medium' | 'low';
export type Repeat = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  category: CategoryKey;
  priority: Priority;
  startTime: string; // ISO
  endTime: string; // ISO
  date: string; // YYYY-MM-DD
  repeat: Repeat;
  reminder: number; // minutes
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  key: CategoryKey | string;
  name: string;
  icon: string;
  color: string;
  emoji?: string;
  custom?: boolean;
}

export interface User {
  name: string;
  email: string;
  avatar: string | null;
  streak: number;
  longestStreak: number;
}
