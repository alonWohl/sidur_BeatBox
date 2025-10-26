import { logger } from '../../services/logger.service.js'
import { scheduleService } from './schedule.service.js'
import { dbService } from '../../services/db.service.js'

export async function getSchedules(req, res) {
	const { loggedinUser } = req

	try {
		const filterBy = {
			name: loggedinUser.isAdmin ? (req.query.branch || req.query.name || loggedinUser.name) : loggedinUser.name,
			week: req.query.week || 'current'
		}

		const schedules = await scheduleService.query(filterBy)

		res.json(schedules)
	} catch (err) {
		logger.error('Failed to get schedules', err)
		res.status(400).send({ err: err.message })
	}
}

export async function getScheduleByBranchName(req, res) {
	const { branch } = req.params

	try {
		const schedule = await scheduleService.getScheduleByBranchName(branch)
		res.json(schedule)
	} catch (err) {
		logger.error('Failed to get schedule', err)
		res.status(400).send({ err: err.message })
	}
}

export async function triggerWeeklyTransition(req, res) {
	const { loggedinUser } = req

	if (!loggedinUser || !loggedinUser.isAdmin) {
		return res.status(403).send({ err: 'Unauthorized - Admin access required' })
	}

	try {
		const { branchName } = req.params

		const collection = await dbService.getCollection('branch')
		const branch = await collection.findOne({ name: branchName })

		if (!branch) {
			return res.status(404).send({ err: 'Branch not found' })
		}

		// Force a transition regardless of the date
		const updatedBranch = await scheduleService.checkAndPerformWeeklyTransition(branch, collection, true)

		res.json({
			success: true,
			message: 'Weekly transition completed successfully',
			branch: {
				name: updatedBranch.name,
				lastScheduleTransition: updatedBranch.lastScheduleTransition
			}
		})
	} catch (err) {
		logger.error('Failed to trigger weekly transition', err)
		res.status(500).send({ err: 'Failed to trigger weekly transition' })
	}
}

// export async function getScheduleByBranchId(req, res) {
//   const { branchId } = req.query

//   try {
//     const schedules = await scheduleService.getScheduleByBranchId(branchId)

//     res.json(schedules)
//   } catch (err) {
//     logger.error('Failed to get schedule', err)
//     res.status(400).send({ err: 'Failed to get schedule' })
//   }
// }

// export async function getScheduleByBranchName(req, res) {
//   const { branch } = req.params

//   try {
//     const schedule = await scheduleService.getScheduleByBranchName(branch)
//     res.json(schedule)
//   } catch (err) {
//     logger.error('Failed to get schedule', err)
//     res.status(400).send({ err: 'Failed to get schedule' })
//   }
// }
// export async function addSchedule(req, res) {
//   const { body: schedule, loggedinUser } = req

//   try {
//     schedule.branchId = loggedinUser.username
//     const addedSchedule = await scheduleService.add(schedule)
//     res.json(addedSchedule)
//   } catch (err) {
//     logger.error('Failed to add schedule', err)
//     res.status(400).send({ err: 'Failed to add schedule' })
//   }
// }

export async function updateSchedule(req, res) {
	const { id } = req.params

	const { body: schedule } = req

	try {
		const updatedSchedule = await scheduleService.update(id, schedule)
		res.json(updatedSchedule)
	} catch (err) {
		logger.error('Failed to update schedule', err)
		res.status(400).send({ err: 'Failed to update schedule' })
	}
}

export async function addSchedule(req, res) {
	const { body: schedule } = req

	try {
		const addedSchedule = await scheduleService.add(schedule)
		res.json(addedSchedule)
	} catch (err) {
		logger.error('Failed to add schedule', err)
		res.status(400).send({ err: 'Failed to add schedule' })
	}
}

// export async function removeSchedule(req, res) {
//   try {
//     const scheduleId = req.params.id
//     const removedId = await scheduleService.remove(scheduleId)

//     res.send(removedId)
//   } catch (err) {
//     logger.error('Failed to remove schedule', err)
//     res.status(400).send({ err: 'Failed to remove schedule' })
//   }
// }
