import express from 'express';

import {requireAuth} from '../../middlewares/requireAuth.middleware.js';
import {log} from '../../middlewares/logger.middleware.js';
import {logger} from '../../services/logger.service.js';

import {getEmployees, getEmployee, addEmployee, updateEmployee, deleteEmployee} from './employee.controller.js';

const router = express.Router();

// Debug middleware to log user info
router.use((req, res, next) => {
	logger.info(`Employee Route: ${req.method} ${req.originalUrl}`);
	logger.info(`Logged in user from request: ${JSON.stringify(req.loggedinUser || 'none')}`);
	next();
});

router.get('/', requireAuth, getEmployees);
router.get('/:id', requireAuth, getEmployee);
router.post('/', requireAuth, addEmployee);
router.put('/:id', requireAuth, updateEmployee);
router.delete('/:id', requireAuth, deleteEmployee);

export const employeeRoutes = router;
