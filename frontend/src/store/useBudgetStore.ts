import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  createdAt: number;
}

interface BudgetState {
  budget: number;
  expenses: Expense[];
  setBudget: (v: number) => void;
  addExpense: (e: Omit<Expense, 'id' | 'createdAt'>) => void;
  removeExpense: (id: string) => void;
  hydrate: () => Promise<void>;
}

const KEY = '@budget_v1';

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budget: 1500,
  expenses: [
    { id: 'e1', title: 'Coffee', amount: 5, category: 'food', createdAt: Date.now() - 86400000 },
    { id: 'e2', title: 'Uber ride', amount: 18, category: 'transport', createdAt: Date.now() - 172800000 },
  ],
  setBudget: (v) => {
    set({ budget: v });
    persist(get);
  },
  addExpense: (e) => {
    const item: Expense = { ...e, id: `${Date.now()}`, createdAt: Date.now() };
    set({ expenses: [item, ...get().expenses] });
    persist(get);
  },
  removeExpense: (id) => {
    set({ expenses: get().expenses.filter((x) => x.id !== id) });
    persist(get);
  },
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.budget === 'number' && Array.isArray(parsed.expenses)) {
          set({ budget: parsed.budget, expenses: parsed.expenses });
        }
      }
    } catch {}
  },
}));

function persist(get: () => BudgetState) {
  const s = get();
  AsyncStorage.setItem(KEY, JSON.stringify({ budget: s.budget, expenses: s.expenses })).catch(() => {});
}
