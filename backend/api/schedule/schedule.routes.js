import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getSchedules, updateSchedule, getScheduleByBranchName } from './schedule.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, requireAuth, getSchedules)
router.get('/:branch', log, requireAuth, getScheduleByBranchName)
router.put('/:id', requireAuth, updateSchedule)
// router.get('/:branch', log, requireAuth, getScheduleByBranchName)
// router.post('/', log, requireAuth, addSchedule)
// router.delete('/:id', requireAuth, removeSchedule)
// router.delete('/:id', requireAuth, requireAdmin, removeSchedule)

export const scheduleRoutes = router
