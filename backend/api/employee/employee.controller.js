import { logger } from '../../services/logger.service.js'
import { employeeService } from './employee.service.js'

export async function getEmployees(req, res) {
  const { loggedinUser } = req
  const filterBy = {
    username: loggedinUser.isAdmin ? req.query.username || loggedinUser.username : loggedinUser.username
  }
  try {
    const employees = await employeeService.query(filterBy)
    res.json(employees)
  } catch (err) {
    logger.error('Failed to get employees', err)
    res.status(400).send({ err: err.message })
  }
}

export async function getEmployee(req, res) {
  const { loggedinUser } = req
  const { id } = req.params
  try {
    const employee = await employeeService.getById(id)
    res.json(employee)
  } catch (err) {
    logger.error('Failed to get employee', err)
    res.status(400).send({ err: err.message })
  }
}

export async function addEmployee(req, res) {
  const { loggedinUser } = req

  const employeeToAdd = {
    name: req.body.name,
    branch: req.body.branch || loggedinUser.name,
    color: req.body.color
  }

  try {
    const employee = await employeeService.add(employeeToAdd)
    res.json(employee)
  } catch (err) {
    logger.error('Failed to add employee', err)
    res.status(400).send({ err: err.message })
  }
}

export async function updateEmployee(req, res) {
  const { loggedinUser } = req
  const { id } = req.params

  const employeeToUpdate = {
    id: id,
    name: req.body.name,
    color: req.body.color,
    branch: req.body.branch || loggedinUser.name
  }

  try {
    const employee = await employeeService.update(employeeToUpdate)
    res.json(employee)
  } catch (err) {
    logger.error('Failed to update employee', err)
    res.status(400).send({ err: err.message })
  }
}

export async function deleteEmployee(req, res) {
  const { loggedinUser } = req
  const { id } = req.params

  try {
    await employeeService.remove(id)
    res.end()
  } catch (err) {
    logger.error('Failed to delete employee', err)
    res.status(400).send({ err: err.message })
  }
}
