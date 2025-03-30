import { scheduleService } from '../services/schedule/schedule.service.remote'
import { store } from './store'
import { ADD_SCHEDULE, REMOVE_SCHEDULE, SET_SCHEDULES, SET_SCHEDULE, UPDATE_SCHEDULE, ADD_SCHEDULE_MSG } from './schedule.reducer'

export async function loadSchedules(filterBy) {
  try {
    const schedules = await scheduleService.query({ ...filterBy })
    store.dispatch(getCmdSetSchedules(schedules))
  } catch (err) {
    console.log('Cannot load schedules', err)
    throw err
  }
}

// export async function loadSchedule(branchId) {
//   try {
//     const schedule = await scheduleService.getScheduleByBranchId(branchName)
//     store.dispatch(getCmdSetSchedule(schedule))
//   } catch (err) {
//     console.log('Cannot load schedule', err)
//     throw err
//   }
// }

export async function removeSchedule(scheduleId) {
  try {
    await scheduleService.remove(scheduleId)
    store.dispatch(getCmdRemoveSchedule(scheduleId))
  } catch (err) {
    console.log('Cannot remove schedule', err)
    throw err
  }
}

export async function addSchedule(schedule) {
  try {
    if (schedule.name.length < 2) {
      throw new Error('שם העובד חייב להכיל לפחות 2 תווים')
    }

    const savedSchedule = await scheduleService.save(schedule)
    store.dispatch(getCmdAddSchedule(savedSchedule))
    return savedSchedule
  } catch (err) {
    console.log('Cannot add schedule', err)
    throw err
  }
}

export async function updateSchedule(schedule) {
  try {
    const savedSchedule = await scheduleService.save(schedule)
    store.dispatch(getCmdUpdateSchedule(savedSchedule))
    return savedSchedule
  } catch (err) {
    console.log('Cannot save schedule', err)
    throw err
  }
}

// export async function addWorkerMsg(workerId, txt) {
//   try {
//     const msg = await scheduleService.addScheduleMsg(scheduleId, txt)
//     store.dispatch(getCmdAddScheduleMsg(msg))
//     return msg
//   } catch (err) {
//     console.log('Cannot add schedule msg', err)
//     throw err
//   }
// }

// Command Creators:
function getCmdSetSchedules(schedules) {
  return {
    type: SET_SCHEDULES,
    schedules
  }
}
function getCmdSetSchedule(schedule) {
  return {
    type: SET_SCHEDULE,
    schedule
  }
}
function getCmdRemoveSchedule(scheduleId) {
  return {
    type: REMOVE_SCHEDULE,
    scheduleId
  }
}
function getCmdAddSchedule(schedule) {
  return {
    type: ADD_SCHEDULE,
    schedule
  }
}
function getCmdUpdateSchedule(schedule) {
  return {
    type: UPDATE_SCHEDULE,
    schedule
  }
}
// function getCmdAddScheduleMsg(msg) {
//   return {
//     type: ADD_SCHEDULE_MSG,
//     msg
//   }
// }

// // unitTestActions()
// async function unitTestActions() {
// 	await loadWorkers();
// 	await addWorker(workerService.getEmptyWorker());
// 	await updateWorker({
// 		_id: 'm1oC7',
// 		title: 'Worker-Good',
// 	});
// 	await removeWorker('m1oC7');
// 	// TODO unit test addWorkerMsg
// }
