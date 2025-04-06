import { create } from 'zustand'
import { userService } from '../services/branch'

// Helper function to get default filter
function getDefaultFilterBy() {
  return {
    name: userService.getLoggedinUser()?.name || '',
    username: userService.getLoggedinUser()?.username || ''
  }
}

// Create the system store
export const useSystemStore = create((set) => ({
  // Initial state
  isLoading: false,
  filterBy: getDefaultFilterBy(),

  // Actions
  setFilterBy: (filterBy) => set({ filterBy }),
  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false })
}))
