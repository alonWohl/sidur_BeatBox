import { create } from 'zustand'
import { userService } from '../services/branch'
import { toast } from 'react-hot-toast'

// Create the user store
export const useUserStore = create((set, get) => ({
  // Initial state
  user: userService.getLoggedinUser(),
  users: [],
  watchedUser: null,

  // Actions
  setUser: (user) => set({ user }),
  setWatchedUser: (user) => set({ watchedUser: user }),
  setUsers: (users) => set({ users }),
  removeUser: (userId) =>
    set((state) => ({
      users: state.users.filter((user) => user._id !== userId)
    })),

  // Async actions
  loadUsers: async () => {
    try {
      const users = await userService.getUsers()
      set({ users })
    } catch (err) {
      console.log('Error loading users:', err)
    }
  },

  login: async (credentials) => {
    try {
      const user = await userService.login(credentials)
      set({ user })
      return user
    } catch (err) {
      console.log('Cannot login', err)
      throw err
    }
  },

  signup: async (credentials) => {
    try {
      const user = await userService.signup(credentials)
      set({ user })
      return user
    } catch (err) {
      console.log('Cannot signup', err)
      throw err
    }
  },

  logout: async () => {
    try {
      await userService.logout()
      set({ user: null })
    } catch (err) {
      console.log('Cannot logout', err)
      throw err
    }
  },

  loadUser: async (userId) => {
    try {
      const user = await userService.getById(userId)
      set({ watchedUser: user })
    } catch (err) {
      toast.error('שגיאה בטעינת המשתמש')
      console.log('Cannot load user', err)
    }
  }
}))
