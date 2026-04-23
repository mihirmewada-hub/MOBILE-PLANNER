import { Task, Category, User } from './types';
import { categoryColors } from '../theme/tokens';

const today = new Date();
const y = today.getFullYear();
const m = String(today.getMonth() + 1).padStart(2, '0');
const d = String(today.getDate()).padStart(2, '0');
const dateStr = `${y}-${m}-${d}`;

const iso = (h: number, min: number) =>
  new Date(y, today.getMonth(), today.getDate(), h, min).toISOString();

export const demoCategories: Category[] = [
  { id: 'c1', key: 'work', name: 'Work', icon: 'briefcase', color: categoryColors.work },
  { id: 'c2', key: 'health', name: 'Health', icon: 'heart', color: categoryColors.health },
  { id: 'c3', key: 'study', name: 'Study', icon: 'book-open', color: categoryColors.study },
  { id: 'c4', key: 'social', name: 'Social', icon: 'users', color: categoryColors.social },
  { id: 'c5', key: 'creative', name: 'Creative', icon: 'palette', color: categoryColors.creative },
];

export const demoTasks: Task[] = [
  {
    id: 't1',
    title: 'Morning run',
    category: 'health',
    priority: 'high',
    startTime: iso(5, 0),
    endTime: iso(6, 2),
    date: dateStr,
    repeat: 'daily',
    reminder: 15,
    completed: true,
    completedAt: iso(6, 2),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't2',
    title: 'Deep work: design system',
    category: 'work',
    priority: 'high',
    startTime: iso(9, 0),
    endTime: iso(11, 30),
    date: dateStr,
    repeat: 'weekly',
    reminder: 30,
    completed: true,
    completedAt: iso(11, 30),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't3',
    title: 'Read: Atomic Habits ch.4',
    category: 'study',
    priority: 'medium',
    startTime: iso(13, 0),
    endTime: iso(13, 45),
    date: dateStr,
    repeat: 'daily',
    reminder: 15,
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't4',
    title: 'Call mom',
    category: 'social',
    priority: 'medium',
    startTime: iso(17, 30),
    endTime: iso(18, 0),
    date: dateStr,
    repeat: 'weekly',
    reminder: 15,
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't5',
    title: 'Sketch logo concepts',
    category: 'creative',
    priority: 'low',
    startTime: iso(19, 0),
    endTime: iso(20, 30),
    date: dateStr,
    repeat: 'none',
    reminder: 30,
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't6',
    title: 'Meditate',
    category: 'health',
    priority: 'low',
    startTime: iso(21, 30),
    endTime: iso(21, 45),
    date: dateStr,
    repeat: 'daily',
    reminder: 0,
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const demoUser: User = {
  name: 'Alex Rivera',
  email: 'alex@crimson.app',
  avatar: null,
  streak: 12,
  longestStreak: 28,
};

// Weekly productivity history (percentages)
export const weeklyProductivity = [62, 78, 45, 88, 71, 95, 33];
