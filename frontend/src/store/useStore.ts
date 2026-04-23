import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Category, User, CategoryKey, Priority, Repeat } from './types';
import { demoCategories, demoTasks, demoUser } from './demoData';

const STORAGE_KEY = '@crimson_noir_state_v1';

interface State {
  tasks: Task[];
  categories: Category[];
  user: User;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt' | 'updatedAt'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const persist = async (state: Pick<State, 'tasks' | 'user'>) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tasks: state.tasks, user: state.user })
    );
  } catch {}
};

export const useStore = create<State>((set, get) => ({
  tasks: demoTasks,
  categories: demoCategories,
  user: demoUser,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          tasks: parsed.tasks ?? demoTasks,
          user: parsed.user ?? demoUser,
          hydrated: true,
        });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },

  addTask: (task) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: `t_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      completed: false,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const next = [newTask, ...get().tasks];
    set({ tasks: next });
    persist({ tasks: next, user: get().user });
  },

  toggleTask: (id) => {
    const now = new Date().toISOString();
    const next = get().tasks.map((t) =>
      t.id === id
        ? { ...t, completed: !t.completed, completedAt: !t.completed ? now : null, updatedAt: now }
        : t
    );
    set({ tasks: next });
    persist({ tasks: next, user: get().user });
  },

  deleteTask: (id) => {
    const next = get().tasks.filter((t) => t.id !== id);
    set({ tasks: next });
    persist({ tasks: next, user: get().user });
  },
}));

export type { CategoryKey, Priority, Repeat };
