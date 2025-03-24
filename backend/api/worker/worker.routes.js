import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getWorkers, addWorker, updateWorker, removeWorker } from './worker.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, requireAuth, getWorkers)
router.post('/', log, requireAuth, addWorker)
router.put('/:id', requireAuth, updateWorker)
router.delete('/:id', requireAuth, removeWorker)
// router.delete('/:id', requireAuth, requireAdmin, removeWorker)

export const workerRoutes = router
