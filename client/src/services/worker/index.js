const { DEV, VITE_LOCAL } = import.meta.env

import { makeId } from '../util.service'
import { workerService as local } from './worker.service.local'
import { workerService as remote } from './worker.service.remote'

function getEmptyWorker() {
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

export const workerService = { getEmptyWorker, getDefaultFilter, ...service }

//* Easy access to this service from the dev tools console
//* when using script - dev / dev:local

if (DEV) window.workerService = workerService
