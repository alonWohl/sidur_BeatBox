const { DEV, VITE_LOCAL } = import.meta.env

import { userService as local } from './branch.service.local.js'
import { userService as remote } from './branch.service.remote.js'

const service = VITE_LOCAL === 'true' ? local : remote
export const userService = { ...service }

// Easy access to this service from the dev tools console
// when using script - dev / dev:local

if (DEV) window.userService = userService
