import {logger} from '../../services/logger.service.js';
import {workerService} from './worker.service.js';

export async function getWorkers(req, res) {
	const {loggedinUser} = req;

	try {
		const filterBy = {
			name: req.query.name || '',
			branch: loggedinUser.isAdmin ? req.query.branch || '' : loggedinUser.username,
		};
		const workers = await workerService.query(filterBy);
		res.json(workers);
	} catch (err) {
		logger.error('Failed to get workers', err);
		res.status(400).send({err: 'Failed to get workers'});
	}
}

export async function addWorker(req, res) {
	const {loggedinUser} = req;

	const worker = {
		name: req.body.name || '',
		color: req.body.color || '#000000',
	};

	try {
		worker.branch = loggedinUser.username;
		const addedWorker = await workerService.add(worker);
		res.json(addedWorker);
	} catch (err) {
		logger.error('Failed to add worker', err);
		res.status(400).send({err: 'Failed to add worker'});
	}
}

export async function updateWorker(req, res) {
	const {body: worker} = req;

	try {
		const updatedWorker = await workerService.update(worker);
		res.json(updatedWorker);
	} catch (err) {
		logger.error('Failed to update worker', err);
		res.status(400).send({err: 'Failed to update worker'});
	}
}

export async function removeWorker(req, res) {
	try {
		const workerId = req.params.id;
		const removedId = await workerService.remove(workerId);

		res.send(removedId);
	} catch (err) {
		logger.error('Failed to remove worker', err);
		res.status(400).send({err: 'Failed to remove worker'});
	}
}
