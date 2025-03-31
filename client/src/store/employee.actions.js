import { employeeService } from '../services/employee'
import { store } from './store'
import { ADD_EMPLOYEE, REMOVE_EMPLOYEE, SET_EMPLOYEES, SET_EMPLOYEE, UPDATE_EMPLOYEE } from './employee.reducer'
import { startLoading, stopLoading } from './system.reducer'

export async function loadEmployees(filterBy) {
  try {
    startLoading()
    const employees = await employeeService.query({ ...filterBy })
    store.dispatch(getCmdSetEmployees(employees))
  } catch (err) {
    console.log('Cannot load employees', err)
    throw err
  } finally {
    stopLoading()
  }
}

export async function loadEmployee(employeeId) {
  try {
    const employee = await employeeService.getById(employeeId)
    store.dispatch(getCmdSetEmployee(employee))
  } catch (err) {
    console.log('Cannot load employee', err)
    throw err
  }
}

export async function removeEmployee(employeeId) {
  try {
    startLoading()
    await employeeService.remove(employeeId)
    store.dispatch(getCmdRemoveEmployee(employeeId))
  } catch (err) {
    console.log('Cannot remove employee', err)
    throw err
  } finally {
    stopLoading()
  }
}

export async function addEmployee(employee) {
  try {
    startLoading()
    const savedEmployee = await employeeService.save(employee)
    store.dispatch(getCmdAddEmployee(savedEmployee))
    return savedEmployee
  } catch (err) {
    console.log('Error form actions ---> Cannot add employee', err)
    throw err
  } finally {
    stopLoading()
  }
}

export async function updateEmployee(employee) {
  try {
    startLoading()
    const savedEmployee = await employeeService.save(employee)
    store.dispatch(getCmdUpdateEmployee(savedEmployee))

    return savedEmployee
  } catch (err) {
    console.log('Cannot save employee', err)
    throw err
  } finally {
    stopLoading()
  }
}

// Command Creators:
function getCmdSetEmployees(employees) {
  return {
    type: SET_EMPLOYEES,
    employees
  }
}
function getCmdSetEmployee(employee) {
  return {
    type: SET_EMPLOYEE,
    employee
  }
}
function getCmdRemoveEmployee(employeeId) {
  return {
    type: REMOVE_EMPLOYEE,
    employeeId
  }
}
function getCmdAddEmployee(employee) {
  return {
    type: ADD_EMPLOYEE,
    employee
  }
}
function getCmdUpdateEmployee(employee) {
  return {
    type: UPDATE_EMPLOYEE,
    employee
  }
}

// unitTestActions()
// async function unitTestActions() {
//   await loadWorkers()
//   await addWorker(workerService.getEmptyWorker())
//   await updateWorker({
//     _id: 'm1oC7',
//     title: 'Worker-Good'
//   })
//   await removeWorker('m1oC7')
//   // TODO unit test addWorkerMsg
// }
