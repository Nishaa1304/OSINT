import { create } from 'zustand'

export const useAlertStore = create((set, get) => ({
  alerts: [],
  unreadCount: 0,

  setAlerts: (alerts) => set({
    alerts,
    unreadCount: alerts.filter((a) => !a.is_read).length,
  }),

  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts],
    unreadCount: state.unreadCount + (alert.is_read ? 0 : 1),
  })),

  markRead: (id) => set((state) => {
    const alerts = state.alerts.map((a) => a.id === id ? { ...a, is_read: true } : a)
    return { alerts, unreadCount: alerts.filter((a) => !a.is_read).length }
  }),

  markAllRead: () => set((state) => ({
    alerts: state.alerts.map((a) => ({ ...a, is_read: true })),
    unreadCount: 0,
  })),

  removeAlert: (id) => set((state) => {
    const alerts = state.alerts.filter((a) => a.id !== id)
    return { alerts, unreadCount: alerts.filter((a) => !a.is_read).length }
  }),
}))
