import {HomePage} from './pages/HomePage';
import {Routes, Route} from 'react-router';
import {Header} from './components/Header';
import {Login} from './pages/Login';
import {WorkersPage} from './pages/WorkersPage';
import {SchedulePage} from './pages/SchedulePage';
import {AdminPage} from './pages/AdminPage';
import {Toaster} from 'react-hot-toast';
function App() {
	return (
		<div className='h-screen w-full bg-neutral-50'>
			<Header />
			<main className='h-[calc(100vh-178px)]'>
				<Routes>
					<Route
						path='/'
						element={<HomePage />}
					/>
					<Route
						path='/login'
						element={<Login />}
					/>
					<Route
						path='/worker'
						element={<WorkersPage />}
					/>
					<Route
						path='/schedule/:branchId'
						element={<SchedulePage />}
					/>
					<Route
						path='/admin'
						element={<AdminPage />}
					/>
				</Routes>
			</main>
			<Toaster position='bottom-right' />
		</div>
	);
}

export default App;
