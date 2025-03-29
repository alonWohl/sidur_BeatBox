import { httpService } from '../http.service'

export const employeeService = {
  query,
  getById,
  save,
  remove
}

async function query(filterBy = { name: '', branch: '', sortField: '', sortDir: '' }) {
  return httpService.get(`employee`, filterBy)
}

function getById(employeeId) {
  return httpService.get(`employee/${employeeId}`)
}

async function remove(employeeId) {
  return httpService.delete(`employee/${employeeId}`)
}

async function save(employee) {
  var savedEmployee
  if (employee._id) {
    savedEmployee = await httpService.put(`employee/${employee._id}`, employee)
  } else {
    savedEmployee = await httpService.post('employee', employee)
  }
  return savedEmployee
}
