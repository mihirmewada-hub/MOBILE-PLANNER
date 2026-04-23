import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BucketItem {
  id: string;
  title: string;
  emoji: string;
  done: boolean;
  createdAt: number;
}

interface BucketState {
  items: BucketItem[];
  addItem: (e: { title: string; emoji: string }) => void;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  hydrate: () => Promise<void>;
}

const KEY = '@bucket_v1';

export const useBucketStore = create<BucketState>((set, get) => ({
  items: [
    { id: 'b1', title: 'See the northern lights', emoji: '🌍', done: false, createdAt: Date.now() - 86400000 },
    { id: 'b2', title: 'Run a marathon', emoji: '💪', done: true, createdAt: Date.now() - 172800000 },
    { id: 'b3', title: 'Learn to surf', emoji: '🏄', done: false, createdAt: Date.now() - 3600000 },
  ],
  addItem: (e) => {
    const item: BucketItem = { id: `${Date.now()}`, title: e.title, emoji: e.emoji, done: false, createdAt: Date.now() };
    set({ items: [item, ...get().items] });
    persist(get);
  },
  toggleItem: (id) => {
    set({ items: get().items.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) });
    persist(get);
  },
  removeItem: (id) => {
    set({ items: get().items.filter((x) => x.id !== id) });
    persist(get);
  },
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          set({ items: parsed });
        } else if (parsed && Array.isArray(parsed.items)) {
          set({ items: parsed.items });
        }
      }
    } catch {}
  },
}));

function persist(get: () => BucketState) {
  AsyncStorage.setItem(KEY, JSON.stringify({ items: get().items })).catch(() => {});
}
