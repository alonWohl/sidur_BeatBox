const { DEV, VITE_LOCAL } = import.meta.env

import { makeId } from '../util.service'
import { employeeService as local } from './employee.service.local.js'
import { employeeService as remote } from './employee.service.remote.js'

function getEmptyEmployee() {
  return {
    name: makeId()
  }
}

function getDefaultFilter() {
  return {
    txt: '',
    sortField: '',
    sortDir: ''
  }
}

const service = VITE_LOCAL === 'true' ? local : remote

export const employeeService = { getEmptyEmployee, getDefaultFilter, ...service }

//* Easy access to this service from the dev tools console
//* when using script - dev / dev:local

if (DEV) window.employeeService = employeeService
