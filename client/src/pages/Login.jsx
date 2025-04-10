import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {useState} from 'react';
import {useUserStore} from '@/stores/useUserStore';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-hot-toast';
import {UserCircle2, Building2, KeyRound, LogIn, CheckCircle2, AlertTriangle, Lock, ShieldCheck} from 'lucide-react';

export function Login() {
	const [user, setUser] = useState({username: '', password: ''});
	const [errors, setErrors] = useState({username: '', password: ''});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();
	const login = useUserStore((state) => state.login);

	const handleUserChange = (value) => {
		setUser({...user, username: value});
		setErrors((prev) => ({...prev, username: ''}));
	};

	const handleChange = (e) => {
		const {name, value} = e.target;
		setUser({...user, [name]: value});
		setErrors((prev) => ({...prev, [name]: ''}));
	};

	const validateForm = () => {
		let isValid = true;
		const newErrors = {username: '', password: ''};

		if (!user.username) {
			newErrors.username = 'חובה לבחור משתמש';
			isValid = false;
		}

		if (!user.password) {
			newErrors.password = 'חובה להזין סיסמא';
			isValid = false;
		} else if (user.password.length < 6) {
			newErrors.password = 'הסיסמא חייבת להכיל לפחות 6 תווים';
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.error('נא למלא את כל השדות הנדרשים', {
				icon: <AlertTriangle className='h-5 w-5 text-red-500' />,
			});
			return;
		}

		try {
			setIsSubmitting(true);
			await login(user);
			toast.success('התחברת בהצלחה', {
				icon: <CheckCircle2 className='h-5 w-5 text-green-500' />,
			});
			navigate(`/`);
		} catch (error) {
			console.error('Login error:', error);
			toast.error('שגיאה בהתחברות. נא לנסות שוב.', {
				icon: <AlertTriangle className='h-5 w-5 text-red-500' />,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='h-full bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center p-4'>
			<div className='max-w-md w-full mt-10'>
				<div className='text-center mb-8'>
					<div className='mx-auto h-20 w-20 bg-red-50 rounded-full flex items-center justify-center shadow-sm'>
						<UserCircle2 className='h-12 w-12 text-[#BE202E]' />
					</div>
					<h2 className='mt-6 text-3xl font-bold text-gray-900'>ברוכים הבאים</h2>
					<p className='mt-2 text-sm text-gray-600'>התחבר כדי לנהל את המשמרות שלך</p>
				</div>

				<div className='bg-white shadow-xl rounded-xl p-8 border border-gray-100'>
					<form
						className='space-y-6'
						onSubmit={handleSubmit}>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700 block flex items-center gap-1.5'>
								<Building2 className='h-4 w-4 text-gray-500' />
								בחר סניף
							</label>
							<Select
								onValueChange={handleUserChange}
								value={user.username}
								name='username'
								dir='rtl'>
								<SelectTrigger
									className={`w-full text-right transition-all hover:border-red-200 ${
										errors.username
											? 'border-red-500 focus:ring-red-500'
											: 'border-gray-300 focus:ring-red-500'
									}`}>
									<SelectValue placeholder='בחר סניף' />
								</SelectTrigger>
								<SelectContent className='text-right'>
									<SelectItem
										value='moked'
										className='text-right flex items-center gap-2'>
										<span className='flex-1'>מוקד</span>
										<Building2 className='h-3.5 w-3.5 text-gray-400 flex-shrink-0' />
									</SelectItem>
									<SelectItem
										value='tlv'
										className='text-right flex items-center gap-2'>
										<span className='flex-1'>תל אביב</span>
										<Building2 className='h-3.5 w-3.5 text-gray-400 flex-shrink-0' />
									</SelectItem>
									<SelectItem
										value='pt'
										className='text-right flex items-center gap-2'>
										<span className='flex-1'>פתח תקווה</span>
										<Building2 className='h-3.5 w-3.5 text-gray-400 flex-shrink-0' />
									</SelectItem>
									<SelectItem
										value='rishon'
										className='text-right flex items-center gap-2'>
										<span className='flex-1'>ראשון לציון</span>
										<Building2 className='h-3.5 w-3.5 text-gray-400 flex-shrink-0' />
									</SelectItem>
									<SelectItem
										value='rosh'
										className='text-right flex items-center gap-2'>
										<span className='flex-1'>ראש העין</span>
										<Building2 className='h-3.5 w-3.5 text-gray-400 flex-shrink-0' />
									</SelectItem>
								</SelectContent>
							</Select>
							{errors.username && (
								<p className='text-red-500 text-sm flex items-center gap-1'>
									<AlertTriangle className='h-3.5 w-3.5' />
									{errors.username}
								</p>
							)}
						</div>

						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700 block flex items-center gap-1.5'>
								<KeyRound className='h-4 w-4 text-gray-500' />
								סיסמא
							</label>
							<div className='relative'>
								<Input
									type='password'
									name='password'
									value={user.password}
									onChange={handleChange}
									className={`w-full pr-9 transition-all hover:border-red-200 ${
										errors.password
											? 'border-red-500 focus:ring-red-500'
											: 'border-gray-300 focus:ring-red-500'
									}`}
									placeholder='הזן סיסמא'
								/>
								<Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
							</div>
							{errors.password && (
								<p className='text-red-500 text-sm flex items-center gap-1'>
									<AlertTriangle className='h-3.5 w-3.5' />
									{errors.password}
								</p>
							)}
						</div>

						<Button
							type='submit'
							className='w-full bg-[#BE202E] hover:bg-[#BE202E]/90 text-white shadow-sm transition-all'
							disabled={isSubmitting}>
							{isSubmitting ? (
								<div className='flex items-center gap-2'>
									<div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full'></div>
									מתחבר...
								</div>
							) : (
								<div className='flex items-center gap-2'>
									<LogIn className='h-4 w-4' />
									התחבר
								</div>
							)}
						</Button>

						<div className='text-center mt-4'>
							<p className='text-xs text-gray-500 flex items-center justify-center gap-1'>
								<ShieldCheck className='h-3 w-3 text-gray-400' />
								המידע מאובטח בהתאם למדיניות הפרטיות
							</p>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
