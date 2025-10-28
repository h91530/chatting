import { create } from 'zustand'

interface User {
  id: string
  email: string
  username: string
}

interface AuthStore {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,

  setUser: (user: User | null) => {
    set({ user })
  },

  logout: () => {
    set({ user: null })
  },
}))
