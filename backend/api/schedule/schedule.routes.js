import express from 'express'

import { requireAdmin, requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getSchedules, getScheduleByBranchId, addSchedule, updateSchedule, removeSchedule } from './schedule.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, requireAdmin, getSchedules)
router.get('/:branchId', log, requireAuth, getScheduleByBranchId)
router.post('/', log, requireAuth, addSchedule)
router.put('/:id', requireAuth, updateSchedule)
router.delete('/:id', requireAuth, removeSchedule)
// router.delete('/:id', requireAuth, requireAdmin, removeSchedule)

export const scheduleRoutes = router
