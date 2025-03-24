import React from 'react';

import SignupForm from '@/app/(auth)/register/RegistrationForm';
import { login, signUp } from '@/utils/actions/auth';

function Page() {
	return (
		<>
			{/*<SignupForm />*/}
			<form>
				<label htmlFor="email">Email:</label>
				<input id="email" name="email" type="email" required />
				<br></br>
				<label htmlFor="password">Password:</label>
				<input id="password" name="password" type="password" required />
				<br></br>
				<button formAction={login}>Log in</button>
				<button formAction={signUp}>Sign up</button>
			</form>
		</>
	);
}

export default Page;
