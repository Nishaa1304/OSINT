import { create } from 'zustand'

export const useHistoryStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  pages: 1,

  setHistory: ({ items, total, pages }) => set({ items, total, pages }),

  setPage: (page) => set({ page }),

  removeItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id),
    total: state.total - 1,
  })),

  toggleBookmark: (id, is_bookmarked) => set((state) => ({
    items: state.items.map((i) => i.id === id ? { ...i, is_bookmarked } : i),
  })),

  addItem: (item) => set((state) => ({
    items: [item, ...state.items],
    total: state.total + 1,
  })),
}))
