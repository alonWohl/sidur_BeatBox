import { create } from 'zustand'
import { employeeService } from '../services/employee'
import { useSystemStore } from './useSystemStore'

// Create the employee store
export const useEmployeeStore = create((set, get) => ({
  // Initial state
  employees: [],
  employee: null,
  error: null,
  lastRemovedEmployee: null,

  // Actions
  setEmployees: (employees) => set({ employees }),
  setEmployee: (employee) => set({ employee }),
  setError: (error) => set({ error }),

  // Async actions
  loadEmployees: async (filterBy) => {
    const { startLoading, stopLoading } = useSystemStore.getState()
    try {
      startLoading()
      const employees = await employeeService.query({ ...filterBy })
      set({ employees })
      return employees
    } catch (err) {
      console.log('Cannot load employees', err)
      throw err
    } finally {
      stopLoading()
    }
  },

  loadEmployee: async (employeeId) => {
    try {
      const employee = await employeeService.getById(employeeId)
      set({ employee })
    } catch (err) {
      console.log('Cannot load employee', err)
      throw err
    }
  },

  removeEmployee: async (employeeId) => {
    const { startLoading, stopLoading } = useSystemStore.getState()
    try {
      startLoading()
      await employeeService.remove(employeeId)
      const lastRemovedEmployee = get().employees.find((employee) => employee.id === employeeId)
      set((state) => ({
        employees: state.employees.filter((employee) => employee.id !== employeeId),
        lastRemovedEmployee
      }))
    } catch (err) {
      console.log('Cannot remove employee', err)
      throw err
    } finally {
      stopLoading()
    }
  },

  addEmployee: async (employee) => {
    const { startLoading, stopLoading } = useSystemStore.getState()
    try {
      startLoading()
      const savedEmployee = await employeeService.save(employee)
      set((state) => ({
        employees: [...state.employees, savedEmployee]
      }))
      return savedEmployee
    } catch (err) {
      console.log('Cannot add employee', err)
      throw err
    } finally {
      stopLoading()
    }
  },

  updateEmployee: async (employee) => {
    const { startLoading, stopLoading } = useSystemStore.getState()
    try {
      startLoading()
      const savedEmployee = await employeeService.save(employee)
      set((state) => ({
        employees: state.employees.map((emp) => (emp.id === savedEmployee.id ? savedEmployee : emp))
      }))
      return savedEmployee
    } catch (err) {
      console.log('Cannot save employee', err)
      throw err
    } finally {
      stopLoading()
    }
  }
}))
