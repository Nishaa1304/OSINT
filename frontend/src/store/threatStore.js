import { create } from 'zustand'

export const useThreatStore = create((set, get) => ({
  results: [],
  currentResult: null,
  loading: false,

  setLoading: (loading) => set({ loading }),
  setCurrentResult: (result) => set({ currentResult: result }),
  addResult: (result) => set((state) => ({
    results: [result, ...state.results].slice(0, 50),
    currentResult: result,
  })),
  clearCurrent: () => set({ currentResult: null }),
}))
