import http from 'http';
import path from 'path';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';

import {setupSocketAPI} from './services/socket.service.js';

import {setupAsyncLocalStorage} from './middlewares/setupAls.middleware.js';

import {authRoutes} from './api/auth/auth.routes.js';
import {userRoutes} from './api/user/user.routes.js';
import {workerRoutes} from './api/worker/worker.routes.js';
import {scheduleRoutes} from './api/schedule/schedule.routes.js';
const app = express();
const server = http.createServer(app);

// Express App Config
app.use(cookieParser());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.resolve('public')));
} else {
	const corsOptions = {
		origin: ['http://127.0.0.1:3000', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://localhost:5173'],
		credentials: true,
	};
	app.use(cors(corsOptions));
}

app.all('*', setupAsyncLocalStorage);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/schedule', scheduleRoutes);

setupSocketAPI(server);

app.get('/secret', (req, res) => {
	if (process.env.SECRET_STR) {
		res.send(process.env.SECRET_STR);
	} else {
		res.send('No secret string attached');
	}
});

// Make every unhandled server-side-route match index.html
// so when requesting http://localhost:3030/unhandled-route...
// it will still serve the index.html file
// and allow vue/react-router to take it from there

app.get('/**', (req, res) => {
	res.sendFile(path.resolve('public/index.html'));
});

import {logger} from './services/logger.service.js';
import {initApp} from './services/init.service.js';
const port = process.env.PORT || 3030;

server.listen(port, () => {
	// initApp();
	logger.info('Server is running on: ' + `http://localhost:${port}/`);
});
