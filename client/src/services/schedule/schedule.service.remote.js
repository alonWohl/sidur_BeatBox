import { httpService } from '../http.service'

export const scheduleService = {
  query,
  getScheduleByBranchId,
  // getScheduleByBranchName,
  save,
  remove,
  update
}

async function query(filterBy = { username: '', sortField: '', sortDir: '' }) {
  const response = await httpService.get(`schedule`, filterBy)
  return response
}

function getScheduleByBranchId(branchId) {
  return httpService.get(`schedule/${branchId}`)
}
// function getScheduleByBranchName(branchName) {
//   return httpService.get(`schedule/${branchName}`)
// }

async function remove(scheduleId) {
  return httpService.delete(`schedule/${scheduleId}`)
}

async function update(schedule) {
  return httpService.put(`schedule/${schedule.branchId}`, schedule)
}

async function save(schedule) {
  const scheduleToSave = {
    ...schedule,
    week: schedule.week || 'current'
  }

  var savedSchedule
  if (scheduleToSave.branchId) {
    savedSchedule = await httpService.put(`schedule/${scheduleToSave.branchId}`, scheduleToSave)
  } else {
    savedSchedule = await httpService.post('schedule', scheduleToSave)
  }
  return savedSchedule
}
