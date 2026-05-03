import { create } from "zustand";

type CounterState = {
  count: number;
  decrement: () => void;
  increment: () => void;
  reset: () => void;
};

// Small example store showing the preferred modular store shape.
export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  decrement: () => set((state) => ({ count: state.count - 1 })),
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));
