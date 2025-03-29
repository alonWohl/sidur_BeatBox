import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

export const workerService = {
  remove,
  query,
  getById,
  add,
  update
}

async function query(filterBy = { branch: '' }) {
  try {
    const criteria = _buildCriteria(filterBy)
    const sort = _buildSort(filterBy)

    const collection = await dbService.getCollection('worker')
    var workerCursor = await collection.find(criteria, { sort })

    const workers = workerCursor.toArray()
    return workers
  } catch (err) {
    logger.error('cannot find workers', err)
    throw err
  }
}

async function getById(workerId) {
  try {
    const criteria = { _id: new ObjectId(workerId) }

    const collection = await dbService.getCollection('worker')
    const worker = await collection.findOne(criteria)

    worker.createdAt = worker._id.getTimestamp()
    return worker
  } catch (err) {
    logger.error(`while finding worker ${workerId}`, err)
    throw err
  }
}

async function remove(workerId) {
  const { loggedinUser } = asyncLocalStorage.getStore()

  try {
    const criteria = {
      _id: new ObjectId(workerId)
    }

    const collection = await dbService.getCollection('worker')
    const res = await collection.deleteOne(criteria)

    if (res.deletedCount === 0) throw 'Not your worker'
    return workerId
  } catch (err) {
    logger.error(`cannot remove worker ${workerId}`, err)
    throw err
  }
}

async function add(worker) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  worker.branch = worker.branch || loggedinUser.username

  try {
    const collection = await dbService.getCollection('worker')
    await collection.insertOne(worker)

    return worker
  } catch (err) {
    logger.error('cannot insert worker', err)
    throw err
  }
}

async function update(worker) {
  const workerToSave = { name: worker.name, color: worker.color }
  try {
    const criteria = { _id: new ObjectId(worker._id) }
    const collection = await dbService.getCollection('worker')

    await collection.updateOne(criteria, { $set: workerToSave })

    return worker
  } catch (err) {
    logger.error(`cannot update worker ${worker._id}`, err)
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
