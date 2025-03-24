export const SET_WORKERS = 'SET_WORKERS'
export const SET_WORKER = 'SET_WORKER'
export const REMOVE_WORKER = 'REMOVE_WORKER'
export const ADD_WORKER = 'ADD_WORKER'
export const UPDATE_WORKER = 'UPDATE_WORKER'
export const ADD_WORKER_MSG = 'ADD_WORKER_MSG'

const initialState = {
  workers: [],
  worker: null
}

export function workerReducer(state = initialState, action) {
  var newState = state
  var workers
  switch (action.type) {
    case SET_WORKERS:
      newState = { ...state, workers: action.workers }
      break
    case SET_WORKER:
      newState = { ...state, worker: action.worker }
      break
    case REMOVE_WORKER:
      const lastRemovedWorker = state.workers.find((worker) => worker._id === action.workerId)
      workers = state.workers.filter((worker) => worker._id !== action.workerId)
      newState = { ...state, workers, lastRemovedWorker }
      break
    case ADD_WORKER:
      newState = { ...state, workers: [...state.workers, action.worker] }
      break
    case UPDATE_WORKER:
      workers = state.workers.map((worker) => (worker._id === action.worker._id ? action.worker : worker))
      newState = { ...state, workers }
      break
    case ADD_WORKER_MSG:
      newState = { ...state, worker: { ...state.worker, msgs: [...(state.worker.msgs || []), action.msg] } }
      break
    default:
  }
  return newState
}

// unitTestReducer()
