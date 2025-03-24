import { workerService } from '../services/worker'
import { store } from '../store/store'
import { ADD_WORKER, REMOVE_WORKER, SET_WORKERS, SET_WORKER, UPDATE_WORKER, ADD_WORKER_MSG } from './worker.reducer'

export async function loadWorkers(filterBy) {
  try {
    const workers = await workerService.query({ ...filterBy })
    store.dispatch(getCmdSetWorkers(workers))
  } catch (err) {
    console.log('Cannot load workers', err)
    throw err
  }
}

export async function loadWorker(workerId) {
  try {
    const worker = await workerService.getById(workerId)
    store.dispatch(getCmdSetWorker(worker))
  } catch (err) {
    console.log('Cannot load worker', err)
    throw err
  }
}

export async function removeWorker(workerId) {
  try {
    await workerService.remove(workerId)
    store.dispatch(getCmdRemoveWorker(workerId))
  } catch (err) {
    console.log('Cannot remove worker', err)
    throw err
  }
}

export async function addWorker(worker) {
  try {
    const savedWorker = await workerService.save(worker)
    store.dispatch(getCmdAddWorker(savedWorker))
    return savedWorker
  } catch (err) {
    console.log('Cannot add worker', err)
    throw err
  }
}

export async function updateWorker(worker) {
  try {
    const savedWorker = await workerService.save(worker)
    store.dispatch(getCmdUpdateWorker(savedWorker))
    return savedWorker
  } catch (err) {
    console.log('Cannot save worker', err)
    throw err
  }
}

export async function addWorkerMsg(workerId, txt) {
  try {
    const msg = await workerService.addWorkerMsg(workerId, txt)
    store.dispatch(getCmdAddWorkerMsg(msg))
    return msg
  } catch (err) {
    console.log('Cannot add worker msg', err)
    throw err
  }
}

// Command Creators:
function getCmdSetWorkers(workers) {
  return {
    type: SET_WORKERS,
    workers
  }
}
function getCmdSetWorker(worker) {
  return {
    type: SET_WORKER,
    worker
  }
}
function getCmdRemoveWorker(workerId) {
  return {
    type: REMOVE_WORKER,
    workerId
  }
}
function getCmdAddWorker(worker) {
  return {
    type: ADD_WORKER,
    worker
  }
}
function getCmdUpdateWorker(worker) {
  return {
    type: UPDATE_WORKER,
    worker
  }
}
function getCmdAddWorkerMsg(msg) {
  return {
    type: ADD_WORKER_MSG,
    msg
  }
}

// unitTestActions()
async function unitTestActions() {
  await loadWorkers()
  await addWorker(workerService.getEmptyWorker())
  await updateWorker({
    _id: 'm1oC7',
    title: 'Worker-Good'
  })
  await removeWorker('m1oC7')
  // TODO unit test addWorkerMsg
}
