import { userService } from '@/services/branch'
import { store } from './store'

export const LOADING_START = 'LOADING_START'
export const LOADING_DONE = 'LOADING_DONE'
export const SET_FILTER_BY = 'SET_FILTER_BY'

const initialState = {
  isLoading: false,
  filterBy: {
    branch: '',
    username: userService.getLoggedinUser()?.username
  }
}

export function systemReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_FILTER_BY:
      return { ...state, filterBy: action.filterBy }
    case LOADING_START:
      return { ...state, isLoading: true }
    case LOADING_DONE:
      return { ...state, isLoading: false }
    default:
      return state
  }
}

export function setFilterBy(filterBy) {
  return store.dispatch({ type: SET_FILTER_BY, filterBy })
}
