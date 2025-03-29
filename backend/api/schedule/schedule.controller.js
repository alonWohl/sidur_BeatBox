import { logger } from '../../services/logger.service.js'
import { scheduleService } from './schedule.service.js'

export async function getSchedules(req, res) {
  const { loggedinUser } = req

  try {
    const filterBy = {
      branch: loggedinUser.isAdmin ? req.query.branch || '' : loggedinUser.username
    }

    const schedules = await scheduleService.query(filterBy)

    res.json(schedules)
  } catch (err) {
    logger.error('Failed to get schedules', err)
    res.status(400).send({ err: 'Failed to get schedules' })
  }
}
export async function getScheduleByBranchId(req, res) {
  const { branchId } = req.query

  try {
    const schedules = await scheduleService.getScheduleByBranchId(branchId)

    res.json(schedules)
  } catch (err) {
    logger.error('Failed to get schedule', err)
    res.status(400).send({ err: 'Failed to get schedule' })
  }
}

export async function getScheduleByBranchName(req, res) {
  const { branch } = req.params

  try {
    const schedule = await scheduleService.getScheduleByBranchName(branch)
    res.json(schedule)
  } catch (err) {
    logger.error('Failed to get schedule', err)
    res.status(400).send({ err: 'Failed to get schedule' })
  }
}
export async function addSchedule(req, res) {
  const { body: schedule, loggedinUser } = req

  try {
    schedule.branchId = loggedinUser.username
    const addedSchedule = await scheduleService.add(schedule)
    res.json(addedSchedule)
  } catch (err) {
    logger.error('Failed to add schedule', err)
    res.status(400).send({ err: 'Failed to add schedule' })
  }
}

export async function updateSchedule(req, res) {
  const { body: schedule } = req

  try {
    const updatedSchedule = await scheduleService.update(schedule)
    res.json(updatedSchedule)
  } catch (err) {
    logger.error('Failed to update schedule', err)
    res.status(400).send({ err: 'Failed to update schedule' })
  }
}

export async function removeSchedule(req, res) {
  try {
    const scheduleId = req.params.id
    const removedId = await scheduleService.remove(scheduleId)

    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove schedule', err)
    res.status(400).send({ err: 'Failed to remove schedule' })
  }
}
