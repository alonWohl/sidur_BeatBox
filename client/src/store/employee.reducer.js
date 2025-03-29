export const SET_EMPLOYEES = 'SET_EMPLOYEES'
export const SET_EMPLOYEE = 'SET_EMPLOYEE'
export const REMOVE_EMPLOYEE = 'REMOVE_EMPLOYEE'
export const ADD_EMPLOYEE = 'ADD_EMPLOYEE'
export const UPDATE_EMPLOYEE = 'UPDATE_EMPLOYEE'
export const SET_ERROR = 'SET_ERROR'

const initialState = {
  employees: [],
  employee: null,
  error: null
}

export function employeeReducer(state = initialState, action) {
  var newState = state
  var employees
  switch (action.type) {
    case SET_EMPLOYEES:
      newState = { ...state, employees: action.employees }
      break
    case SET_EMPLOYEE:
      newState = { ...state, employee: action.employee }
      break
    case REMOVE_EMPLOYEE:
      const lastRemovedEmployee = state.employees.find((employee) => employee._id === action.employeeId)
      employees = state.employees.filter((employee) => employee._id !== action.employeeId)
      newState = { ...state, employees, lastRemovedEmployee }
      break
    case ADD_EMPLOYEE:
      newState = { ...state, employees: [...state.employees, action.employee] }
      break
    case UPDATE_EMPLOYEE:
      employees = state.employees.map((employee) => (employee._id === action.employee._id ? action.employee : employee))
      newState = { ...state, employees }
      break
    case SET_ERROR:
      newState = { ...state, error: action.error }
      break
    default:
  }
  return newState
}

// unitTestReducer()
