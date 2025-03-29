import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { userService } from '../branch/user.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

export const employeeService = {
  query,
  getById,
  add,
  update,
  remove
}

async function query(filterBy = { username: '' }) {
  const collection = await dbService.getCollection('branch')
  try {
    const filter = {
      username: filterBy.username
    }
    const branch = await collection.findOne(filter)
    return branch.employees
  } catch (err) {
    logger.error('Cannot find employees', err)
    throw err
  }
}

async function getById(employeeId) {
  const collection = await dbService.getCollection('branch')
  try {
    const filter = {
      employees: { $elemMatch: { id: employeeId } }
    }
    const branch = await collection.findOne(filter)
    return branch.employees.find((employee) => employee.id === employeeId)
  } catch (err) {
    logger.error('Cannot find employee', err)
    throw err
  }
}

async function add(employee) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  try {
    employee.id = makeId()
    const collection = await dbService.getCollection('branch')
    const addedEmployee = await collection.updateOne({ username: loggedinUser.username }, { $push: { employees: employee } })
    if (addedEmployee.matchedCount === 0) {
      throw new Error('Branch not found')
    }
    return employee
  } catch (err) {
    logger.error('Cannot add employee', err)
    throw err
  }
}

async function update(employeeId, employee) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  const collection = await dbService.getCollection('branch')
  try {
    const updatedEmployee = await collection.updateOne(
      { _id: new ObjectId(loggedinUser._id), 'employees.id': employeeId },
      { $set: { 'employees.$.name': employee.name, 'employees.$.color': employee.color } }
    )
    return updatedEmployee
  } catch (err) {
    logger.error('Cannot update employee', err)
    throw err
  }
}

async function remove(employeeId) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  try {
    const collection = await dbService.getCollection('branch')
    await collection.updateOne({ username: loggedinUser.username }, { $pull: { employees: { id: employeeId } } })
  } catch (err) {
    logger.error('Cannot remove employee', err)
    throw err
  }
}
