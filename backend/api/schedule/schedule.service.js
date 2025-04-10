import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'
import { makeId } from '../../services/util.service.js'

export const scheduleService = {
  remove,
  query,
  add,
  update,
  getEmptySchedule,
  getScheduleByBranchName
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

    console.log(`Query schedule for branch ${branch.name} with week mode: ${filterBy.week}`)

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

        console.log('Initialized nextWeekSchedule:', JSON.stringify(branch.nextWeekSchedule))
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
