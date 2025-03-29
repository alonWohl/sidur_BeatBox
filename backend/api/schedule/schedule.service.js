import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

export const scheduleService = {
  remove,
  query,
  add,
  update,
  getEmptySchedule
}

async function query(filterBy = { branch: '' }) {
  try {
    const collection = await dbService.getCollection('branch')

    if (filterBy.branch.isAdmin) {
      const branches = await collection.find({}).toArray()
      return branches.map((branch) => ({
        branchName: branch.name,
        branchId: branch._id,
        schedule: branch.schedule
      }))
    }

    const branch = await collection.findOne({
      username: filterBy.branch.username
    })

    if (!branch) {
      throw new Error('Branch not found')
    }

    return [
      {
        branchName: branch.name,
        branchId: branch._id,
        schedule: branch.schedule
      }
    ]
  } catch (err) {
    logger.error('cannot find schedules', err)
    throw err
  }
}

// async function getScheduleByBranchId(branchId) {
//   try {
//     const criteria = { branch: branchId }

//     const collection = await dbService.getCollection('schedule')
//     const schedule = await collection.findOne(criteria)

//     schedule.createdAt = schedule._id.getTimestamp()
//     return schedule
//   } catch (err) {
//     logger.error(`while finding schedule ${branchId}`, err)
//     throw err
//   }
// }

// async function getScheduleByBranchName(branchName) {
//   console.log('🚀 ~ getScheduleByBranchName ~ branchName:', branchName)
//   try {
//     const criteria = { branch: branchName }
//     const collection = await dbService.getCollection('schedule')
//     const schedule = await collection.findOne(criteria)
//     return schedule
//   } catch (err) {
//     logger.error(`while finding schedule ${branchName}`, err)
//     throw err
//   }
// }

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
  try {
    const collection = await dbService.getCollection('schedule')
    await collection.insertOne(schedule)

    return schedule
  } catch (err) {
    logger.error('cannot insert schedule', err)
    throw err
  }
}

async function update(schedule, loggedInUser) {
  try {
    const collection = await dbService.getCollection('branch')

    // Find the branch
    const branch = await collection.findOne({
      _id: ObjectId.createFromHexString(schedule.branchId)
    })

    if (!branch) {
      throw new Error('Branch not found')
    }

    // Check permissions
    if (!loggedInUser.isAdmin && loggedInUser.username !== branch.username) {
      throw new Error('Unauthorized to update this schedule')
    }

    // Update the schedule
    await collection.updateOne(
      { _id: ObjectId.createFromHexString(schedule.branchId) },
      {
        $set: {
          'schedule.days': schedule.days
        }
      }
    )

    return {
      branchName: branch.name,
      branchId: branch._id,
      schedule: {
        days: schedule.days
      }
    }
  } catch (err) {
    logger.error(`cannot update schedule for branch ${schedule.branchId}`, err)
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
