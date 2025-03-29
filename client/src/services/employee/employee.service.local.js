import { storageService } from '../async-storage.service'
import { makeId, getRandomColor } from '../util.service'
import { userService } from '../branch'

const STORAGE_KEY = 'employee'
_createDemoEmployees()

export const employeeService = {
  query,
  getById,
  save,
  remove
}
window.cs = employeeService
async function query(filterBy = { name: '' }) {
  var employees = await storageService.query(STORAGE_KEY)
  if (!employees.length) {
    employees = _createDemoEmployees()
  }
  console.log('employees:', employees)
  const { name } = filterBy

  if (name) {
    const regex = new RegExp(filterBy.name, 'i')
    employees = employees.filter((employee) => regex.test(employee.name))
  }

  employees = employees.map(({ _id, name, color }) => ({ _id, name, color }))
  return employees
}

function getById(employeeId) {
  return storageService.get(STORAGE_KEY, employeeId)
}

async function remove(employeeId) {
  // throw new Error('Nope')
  await storageService.remove(STORAGE_KEY, employeeId)
}

async function save(employee) {
  var savedEmployee
  if (employee._id) {
    const employeeToSave = {
      _id: employee._id,
      color: employee.color,
      name: employee.name
    }
    savedEmployee = await storageService.put(STORAGE_KEY, employeeToSave)
  } else {
    const employeeToSave = {
      color: employee.color,
      name: employee.name
    }
    savedEmployee = await storageService.post(STORAGE_KEY, employeeToSave)
  }
  return savedEmployee
}

function _createDemoEmployees() {
  let employees = storageService.query()
  if (!employees.length) {
    employees = []
    for (let i = 0; i < 10; i++) {
      employees.push({ _id: makeId(), name: `Employee ${i}`, color: getRandomColor() })
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees))
  }
}
