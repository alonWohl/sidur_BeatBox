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
  console.log('Querying schedules with filter:', filterBy)
  const response = await httpService.get(`schedule`, filterBy)
  console.log('Query response:', response)
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
  // Ensure week parameter is properly sent
  const scheduleToSave = {
    ...schedule,
    week: schedule.week || 'current' // Ensure week is explicitly set
  }

  console.log('Saving schedule:', scheduleToSave)

  var savedSchedule
  if (scheduleToSave.branchId) {
    console.log('Updating existing schedule')
    savedSchedule = await httpService.put(`schedule/${scheduleToSave.branchId}`, scheduleToSave)
  } else {
    console.log('Creating new schedule')
    savedSchedule = await httpService.post('schedule', scheduleToSave)
  }
  console.log('Save response:', savedSchedule)
  return savedSchedule
}
