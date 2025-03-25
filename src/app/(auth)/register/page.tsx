import React, { Suspense } from 'react';

import { login, signUp } from '@/app/(auth)/login/actions';
import AuthComponent from '@/app/(auth)/login/components/AuthComponent';

function Register() {
	return (
		<>
			<AuthComponent />
			{/*<form>*/}
			{/*	<label htmlFor="email">Email:</label>*/}
			{/*	<input id="email" name="email" type="email" required />*/}
			{/*	<br></br>*/}
			{/*	<label htmlFor="password">Password:</label>*/}
			{/*	<input id="password" name="password" type="password" required />*/}
			{/*	<br></br>*/}
			{/*	<button formAction={login}>Log in</button>*/}
			{/*	<button formAction={signUp}>Sign up</button>*/}
			{/*</form>*/}
		</>
	);
}

export default Register;
