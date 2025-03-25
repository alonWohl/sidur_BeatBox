const { DEV, VITE_LOCAL } = import.meta.env

import { userService as local } from './user.service.local.js'
import { userService as remote } from './user.service.remote'

const service = VITE_LOCAL === 'true' ? local : remote
export const userService = { ...service }

// Easy access to this service from the dev tools console
// when using script - dev / dev:local

if (DEV) window.userService = userService
