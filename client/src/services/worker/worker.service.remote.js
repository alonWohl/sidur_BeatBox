import { httpService } from '../http.service'

export const workerService = {
  query,
  getById,
  save,
  remove
}

async function query(filterBy = { name: '', branch: '', sortField: '', sortDir: '' }) {
  return httpService.get(`worker`, filterBy)
}

function getById(workerId) {
  return httpService.get(`worker/${workerId}`)
}

async function remove(workerId) {
  return httpService.delete(`worker/${workerId}`)
}

async function save(worker) {
  var savedWorker
  if (worker._id) {
    savedWorker = await httpService.put(`worker/${worker._id}`, worker)
  } else {
    savedWorker = await httpService.post('worker', worker)
  }
  return savedWorker
}
