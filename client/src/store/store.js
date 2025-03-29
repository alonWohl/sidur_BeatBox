import { legacy_createStore as createStore, combineReducers } from 'redux'

import { userReducer } from './user.reducer'
import { systemReducer } from './system.reducer'
import { employeeReducer } from './employee.reducer'
import { scheduleReducer } from './schedule.reducer'

const rootReducer = combineReducers({
  userModule: userReducer,
  employeeModule: employeeReducer,
  systemModule: systemReducer,
  scheduleModule: scheduleReducer
})

const middleware = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__() : undefined
export const store = createStore(rootReducer, middleware)

// For debug:
// store.subscribe(() => {
//     console.log('**** Store state changed: ****')
//     console.log('storeState:\n', store.getState())
//     console.log('*******************************')
// })
