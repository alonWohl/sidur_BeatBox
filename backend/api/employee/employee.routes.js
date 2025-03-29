import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getEmployees, getEmployee, addEmployee, updateEmployee, deleteEmployee } from './employee.controller.js'

const router = express.Router()

router.get('/', requireAuth, getEmployees)
router.get('/:id', requireAuth, getEmployee)
router.post('/', requireAuth, addEmployee)
router.put('/:id', requireAuth, updateEmployee)
router.delete('/:id', requireAuth, deleteEmployee)

export const employeeRoutes = router
