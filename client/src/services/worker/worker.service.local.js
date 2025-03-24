import { storageService } from '../async-storage.service'
import { makeId, getRandomColor } from '../util.service'
import { userService } from '../user'

const STORAGE_KEY = 'worker'
_createDemoWorkers()

export const workerService = {
  query,
  getById,
  save,
  remove
}
window.cs = workerService
async function query(filterBy = { name: '' }) {
  var workers = await storageService.query(STORAGE_KEY)
  if (!workers.length) {
    workers = _createDemoWorkers()
  }
  console.log('workers:', workers)
  const { name } = filterBy

  if (name) {
    const regex = new RegExp(filterBy.name, 'i')
    workers = workers.filter((worker) => regex.test(worker.name))
  }

  workers = workers.map(({ _id, name, color }) => ({ _id, name, color }))
  return workers
}

function getById(workerId) {
  return storageService.get(STORAGE_KEY, workerId)
}

async function remove(workerId) {
  // throw new Error('Nope')
  await storageService.remove(STORAGE_KEY, workerId)
}

async function save(worker) {
  var savedWorker
  if (worker._id) {
    const workerToSave = {
      _id: worker._id,
      color: worker.color,
      name: worker.name
    }
    savedWorker = await storageService.put(STORAGE_KEY, workerToSave)
  } else {
    const workerToSave = {
      color: worker.color,
      name: worker.name
    }
    savedWorker = await storageService.post(STORAGE_KEY, workerToSave)
  }
  return savedWorker
}

function _createDemoWorkers() {
  let workers = storageService.query()
  if (!workers.length) {
    workers = []
    for (let i = 0; i < 10; i++) {
      workers.push({ _id: makeId(), name: `Worker ${i}`, color: getRandomColor() })
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workers))
  }
}
