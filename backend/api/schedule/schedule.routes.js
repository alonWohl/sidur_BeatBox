import express from 'express'

import { requireAdmin, requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getSchedules, getScheduleByBranchName, addSchedule, updateSchedule, removeSchedule } from './schedule.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, requireAuth, requireAdmin, getSchedules)
router.get('/:branch', log, requireAuth, getScheduleByBranchName)
router.post('/', log, requireAuth, addSchedule)
router.put('/:id', requireAuth, updateSchedule)
router.delete('/:id', requireAuth, removeSchedule)
// router.delete('/:id', requireAuth, requireAdmin, removeSchedule)

export const scheduleRoutes = router
