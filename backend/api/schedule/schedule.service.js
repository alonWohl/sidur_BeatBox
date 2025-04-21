import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'
import { makeId } from '../../services/util.service.js'
import { startOfWeek, addDays, isBefore, format } from 'date-fns'

export const scheduleService = {
	remove,
	query,
	add,
	update,
	getEmptySchedule,
	getScheduleByBranchName,
	checkAndPerformWeeklyTransition
}

async function query(filterBy = { name: '', username: '', week: 'current' }) {
	const { loggedinUser } = asyncLocalStorage.getStore()
	try {
		const collection = await dbService.getCollection('branch')

		let branch = await collection.findOne({
			name: filterBy.name
		})

		if (!branch) {
			throw new Error('Branch not found')
		}

		// Check if a week transition is needed before proceeding
		branch = await checkAndPerformWeeklyTransition(branch, collection)

		let scheduleKey = 'schedule'

		if (filterBy.week === 'next') {
			scheduleKey = 'nextWeekSchedule'

			if (!branch.nextWeekSchedule || !branch.nextWeekSchedule.days) {
				console.log(`Initializing empty nextWeekSchedule for branch ${branch.name}`)

				const emptySchedule = JSON.parse(JSON.stringify(getEmptySchedule()))

				console.log('Creating fresh empty schedule for next week:', JSON.stringify(emptySchedule))

				await collection.updateOne({ _id: branch._id }, { $set: { nextWeekSchedule: emptySchedule } })

				branch = await collection.findOne({
					name: filterBy.name
				})
			}
		}

		const schedule = {
			id: makeId(),
			branchId: branch._id,
			branchName: branch.name,
			week: filterBy.week || 'current',
			days: branch[scheduleKey]?.days || getEmptySchedule().days
		}

		return schedule
	} catch (err) {
		logger.error('cannot find schedules', err)
		throw err
	}
}

/**
 * Checks if a week transition should occur and performs the transition if needed.
 * This moves the nextWeekSchedule to schedule and creates a new empty nextWeekSchedule.
 * @param {Object} branch - The branch document from the database
 * @param {Object} collection - The MongoDB collection
 * @param {Boolean} force - If true, force a transition regardless of date
 * @returns {Object} - The updated branch document
 */
async function checkAndPerformWeeklyTransition(branch, collection, force = false) {
	try {
		// Get today's date and the start of the current week (Sunday)
		const today = new Date()
		const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 })

		// Get or initialize the last transition date
		const lastTransitionDate = branch.lastScheduleTransition ? new Date(branch.lastScheduleTransition) : null

		// If no transition date exists or the last transition was before the start of the current week,
		// or if force flag is true, perform a transition
		const needsTransition = force || !lastTransitionDate || isBefore(lastTransitionDate, currentWeekStart)

		if (needsTransition) {
			console.log(`Performing weekly schedule transition for branch ${branch.name}${force ? ' (forced)' : ''}`)

			// Store the current schedule in history if needed
			let scheduleHistory = branch.scheduleHistory || []
			if (branch.schedule && branch.schedule.days) {
				const weekEndingDate = addDays(currentWeekStart, -1) // The day before the current week started
				scheduleHistory.push({
					weekEnding: format(weekEndingDate, 'yyyy-MM-dd'),
					schedule: branch.schedule
				})

				// Limit history to the most recent 12 weeks
				if (scheduleHistory.length > 12) {
					scheduleHistory = scheduleHistory.slice(-12)
				}
			}

			// Move next week's schedule to current week's schedule
			const updatedBranch = {
				schedule: branch.nextWeekSchedule || getEmptySchedule(),
				nextWeekSchedule: getEmptySchedule(),
				lastScheduleTransition: new Date().toISOString(),
				scheduleHistory
			}

			// Update the branch in the database
			await collection.updateOne({ _id: branch._id }, { $set: updatedBranch })

			// Refresh the branch data
			branch = await collection.findOne({ _id: branch._id })
			console.log(`Weekly transition completed for branch ${branch.name}`)
		}

		return branch
	} catch (err) {
		logger.error('Error during weekly schedule transition', err)
		// Return the original branch without changes if there's an error
		return branch
	}
}

async function getScheduleByBranchName(branchName) {
	try {
		const collection = await dbService.getCollection('branch')
		const branch = await collection.findOne({ name: branchName })
		return branch.schedule
	} catch (err) {
		logger.error('cannot find schedules', err)
		throw err
	}
}

async function remove(scheduleId) {
	const { loggedinUser } = asyncLocalStorage.getStore()

	try {
		const criteria = {
			_id: ObjectId.createFromHexString(scheduleId)
		}

		const collection = await dbService.getCollection('schedule')
		const res = await collection.deleteOne(criteria)

		if (res.deletedCount === 0) throw 'Not your schedule'
		return scheduleId
	} catch (err) {
		logger.error(`cannot remove schedule ${scheduleId}`, err)
		throw err
	}
}

async function add(schedule) {
	const { loggedinUser } = asyncLocalStorage.getStore()
	try {
		const collection = await dbService.getCollection('branch')
		await collection.updateOne({ username: loggedinUser.username }, { $push: { schedule: schedule } })

		return schedule
	} catch (err) {
		logger.error('cannot insert schedule', err)
		throw err
	}
}

async function update(branchId, schedule) {
	const { loggedinUser } = asyncLocalStorage.getStore()
	try {
		const collection = await dbService.getCollection('branch')

		const branch = await collection.findOne({
			_id: new ObjectId(branchId)
		})

		if (!branch) {
			throw new Error('Branch not found')
		}

		if (!loggedinUser.isAdmin && loggedinUser.username !== branch.username) {
			throw new Error('Unauthorized to update this schedule')
		}

		// Determine which schedule to update based on the week parameter
		const week = schedule.week || 'current'
		console.log(`Updating schedule for branch ${branch.name} with week mode: ${week}`)

		// Create full update object instead of just updating days to ensure proper structure
		let updateObj = {}

		if (week === 'next') {
			// For next week, create a completely fresh copy of the schedule
			const freshNextWeekSchedule = {
				days: JSON.parse(JSON.stringify(schedule.days))
			}

			console.log('Updating next week schedule with fresh copy:', JSON.stringify(freshNextWeekSchedule))

			// For next week, update the entire nextWeekSchedule structure
			updateObj = {
				nextWeekSchedule: freshNextWeekSchedule
			}

			// Initialize if it doesn't exist
			if (!branch.nextWeekSchedule) {
				console.log(`Initializing nextWeekSchedule for branch ${branch._id} during update`)

				// First ensure the structure exists with a fresh empty schedule
				const emptySchedule = JSON.parse(JSON.stringify(getEmptySchedule()))
				await collection.updateOne({ _id: new ObjectId(branchId) }, { $set: { nextWeekSchedule: emptySchedule } })
			}
		} else {
			// For current week, create a fresh copy of the days
			const freshCurrentDays = JSON.parse(JSON.stringify(schedule.days))
			console.log('Updating current week schedule days')

			// For current week, update the schedule structure
			updateObj = {
				'schedule.days': freshCurrentDays
			}
		}

		// Update the schedule in the database
		const updatedSchedule = await collection.updateOne({ _id: new ObjectId(branchId) }, { $set: updateObj })

		// Return the updated schedule with the week property
		return {
			days: schedule.days,
			week
		}
	} catch (err) {
		logger.error(`cannot update schedule for branch ${branchId}`, err)
		throw err
	}
}

function _buildCriteria(filterBy) {
	const criteria = {
		branch: { $regex: filterBy.branch, $options: 'i' }
	}

	return criteria
}

function _buildSort(filterBy) {
	if (!filterBy.sortField) return {}
	return { [filterBy.sortField]: filterBy.sortDir }
}

function getEmptySchedule() {
	return {
		days: [
			{
				dayId: 1,
				name: 'ראשון',
				shifts: []
			},
			{
				dayId: 2,
				name: 'שני',
				shifts: []
			},
			{
				dayId: 3,
				name: 'שלישי',
				shifts: []
			},
			{
				dayId: 4,
				name: 'רביעי',
				shifts: []
			},
			{
				dayId: 5,
				name: 'חמישי',
				shifts: []
			},
			{
				dayId: 6,
				name: 'שישי',
				shifts: []
			},
			{
				dayId: 7,
				name: 'שבת',
				shifts: []
			}
		]
	}
}
