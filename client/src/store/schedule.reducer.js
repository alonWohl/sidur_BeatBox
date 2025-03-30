export const SET_SCHEDULES = 'SET_SCHEDULES'
export const SET_SCHEDULE = 'SET_SCHEDULE'
export const REMOVE_SCHEDULE = 'REMOVE_SCHEDULE'
export const ADD_SCHEDULE = 'ADD_SCHEDULE'
export const UPDATE_SCHEDULE = 'UPDATE_SCHEDULE'
export const ADD_SCHEDULE_MSG = 'ADD_SCHEDULE_MSG'
export const SET_ERROR = 'SET_ERROR'

const initialState = {
  schedule: {
    branchId: '',
    branchName: '',
    days: []
  },
  schedules: [],
  error: null
}

export function scheduleReducer(state = initialState, action) {
  var newState = state
  var schedules
  switch (action.type) {
    case SET_SCHEDULES:
      newState = { ...state, schedules: action.schedules }
      break
    case SET_SCHEDULE:
      newState = { ...state, schedule: action.schedule }
      break
    case REMOVE_SCHEDULE:
      const lastRemovedSchedule = state.find((schedule) => schedule.id === action.scheduleId)
      schedules = state.schedules.filter((schedule) => schedule.id !== action.scheduleId)
      newState = { ...state, schedules, lastRemovedSchedule }
      break
    case ADD_SCHEDULE:
      newState = { ...state, schedules: [...state.schedules, action.schedule] }
      break
    case UPDATE_SCHEDULE:
      console.log('🚀 ~ scheduleReducer ~ action:', action)
      newState = {
        ...state,
        schedules: { ...state.schedules, ...action.schedule }
      }
      break
    case ADD_SCHEDULE_MSG:
      newState = { ...state, schedule: { ...state.schedule, msgs: [...(state.schedule.msgs || []), action.msg] } }
      break
    case SET_ERROR:
      newState = { ...state, error: action.error }
      break
    default:
  }
  return newState
}

// unitTestReducer()
