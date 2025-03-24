import { httpService } from '../http.service'

export const scheduleService = {
  query,
  getScheduleByBranchId,
  getScheduleByBranchName,
  save,
  remove,
  update
}

async function query(filterBy = { branch: '', sortField: '', sortDir: '' }) {
  return httpService.get(`schedule`, filterBy)
}

function getScheduleByBranchId(branchId) {
  return httpService.get(`schedule/${branchId}`)
}
function getScheduleByBranchName(branchName) {
  return httpService.get(`admin/schedule/${branchName}`)
}

async function remove(scheduleId) {
  return httpService.delete(`schedule/${scheduleId}`)
}

async function update(schedule) {
  return httpService.put(`schedule/${schedule._id}`, schedule)
}

async function save(schedule) {
  var savedSchedule
  if (schedule._id) {
    savedSchedule = await httpService.put(`schedule/${schedule._id}`, schedule)
  } else {
    savedSchedule = await httpService.post('schedule', schedule)
  }
  return savedSchedule
}
