import {logger} from '../../services/logger.service.js';
import {employeeService} from './employee.service.js';

export async function getEmployees(req, res) {
	const {loggedinUser} = req;
	const filterBy = {
		name: loggedinUser.isAdmin ? req.query.name || loggedinUser.name : loggedinUser.name,
	};
	try {
		const employees = await employeeService.query(filterBy);
		res.json(employees);
	} catch (err) {
		logger.error('Failed to get employees', err);
		res.status(400).send({err: err.message});
	}
}

export async function getEmployee(req, res) {
	const {loggedinUser} = req;
	const {id} = req.params;
	try {
		const employee = await employeeService.getById(id);
		res.json(employee);
	} catch (err) {
		logger.error('Failed to get employee', err);
		res.status(400).send({err: err.message});
	}
}

export async function addEmployee(req, res) {
	const {loggedinUser} = req;
	const isMoked = req.body.branch === 'מוקד';

	const employeeToAdd = {
		name: req.body.name,
		branch: loggedinUser.isAdmin ? req.body.branch || loggedinUser.name : loggedinUser.name,
		color: req.body.color,
		departments: isMoked ? [] : req.body.departments || ['waiters'],
	};

	try {
		const employee = await employeeService.add(employeeToAdd);
		res.json(employee);
	} catch (err) {
		logger.error('Failed to add employee', err);
		res.status(400).send({err: err.message});
	}
}

export async function updateEmployee(req, res) {
	const {loggedinUser} = req;
	const {id} = req.params;
	const isMoked = req.body.branch === 'מוקד';

	const employeeToUpdate = {
		id: id,
		name: req.body.name,
		color: req.body.color,
		branch: req.body.branch || loggedinUser.name,
		departments: isMoked ? [] : req.body.departments || ['waiters'],
	};

	try {
		const employee = await employeeService.update(employeeToUpdate);
		res.json(employee);
	} catch (err) {
		logger.error('Failed to update employee', err);
		res.status(400).send({err: err.message});
	}
}

export async function deleteEmployee(req, res) {
	const {loggedinUser} = req;
	const {id} = req.params;

	try {
		await employeeService.remove(id);
		res.end();
	} catch (err) {
		logger.error('Failed to delete employee', err);
		res.status(400).send({err: err.message});
	}
}
