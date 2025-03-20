'use server';

import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { db } from '@/db';
import { usersTable as users } from '@/db/schema';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
	const supabase = await createClient();

	// type-casting here for convenience
	// in practice, you should validate your inputs
	const data = {
		email: formData.get('email') as string,
		password: formData.get('password') as string,
	};

	const { error } = await supabase.auth.signInWithPassword(data);

	if (error) {
		redirect('/error');
	}

	revalidatePath('/', 'layout');
	redirect('/profile');
}

export async function signUp(formData: FormData) {
	const supabase = await createClient();

	// type-casting here for convenience
	// in practice, you should validate your inputs
	const data = {
		email: formData.get('email') as string,
		password: formData.get('password') as string,
	};

	const { error } = await supabase.auth.signUp(data);

	if (error) {
		redirect('/error');
	}

	revalidatePath('/', 'layout');
	redirect('/profile');
}

// @/src/utils/actions/auth.ts
// 'use server';
//
// import { hash } from 'bcryptjs';
// import { eq } from 'drizzle-orm';
// import { revalidatePath } from 'next/cache';
// import { redirect } from 'next/navigation';
//
// import { db } from '@/db';
// import { usersTable as users } from '@/db/schema';
// import { createClient } from '@/utils/supabase/server';
//
// export async function login(formData: FormData) {
// 	const supabase = await createClient();
//
// 	// type-casting here for convenience
// 	// in practice, you should validate your inputs
// 	const data = {
// 		email: formData.get('email') as string,
// 		password: formData.get('password') as string,
// 	};
//
// 	const { error } = await supabase.auth.signInWithPassword(data);
//
// 	if (error) {
// 		redirect('/error');
// 	}
//
// 	revalidatePath('/', 'layout');
// 	redirect('/profile');
// }
//
// export async function signUp(formData: FormData) {
// 	const supabase = await createClient();
//
// 	// Extract all form data
// 	const email = formData.get('email') as string;
// 	const password = formData.get('password') as string;
// 	const firstName = formData.get('firstName') as string;
// 	const lastName = formData.get('lastName') as string;
// 	const role = formData.get('role') as 'DESIGNER' | 'DEVELOPER';
//
// 	// Create user in Supabase Auth
// 	const { data: authData, error: authError } = await supabase.auth.signUp({
// 		email,
// 		password,
// 		options: {
// 			data: {
// 				firstName,
// 				lastName,
// 				role,
// 			},
// 		},
// 	});
//
// 	if (authError) {
// 		throw new Error(authError.message);
// 	}
//
// 	// Hash the password for our own database
// 	const hashedPassword = await hash(password, 10);
//
// 	// Store the user in our own database
// 	try {
// 		await db.insert(users).values({
// 			email,
// 			password: hashedPassword,
// 			firstName,
// 			lastName,
// 			role,
// 		});
// 	} catch (dbError) {
// 		// If database insertion fails, cleanup the auth user
// 		await supabase.auth.admin.deleteUser(authData.user!.id);
// 		throw new Error('Er ging iets mis bij het opslaan van je gegevens.');
// 	}
//
// 	revalidatePath('/', 'layout');
// 	redirect('/profile');
// }
