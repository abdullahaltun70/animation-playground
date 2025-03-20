// 'use client';
// import { useState } from 'react';
//
// import { useForm } from '@tanstack/react-form';
// import { zodValidator } from '@tanstack/zod-form-adapter';
// import { z } from 'zod';
//
// import styles from './SignupForm.module.scss';
//
// // Validation schema for the form
// const signupSchema = z.object({
// 	firstName: z.string().min(2, 'Voornaam moet minimaal 2 karakters bevatten'),
// 	lastName: z.string().min(2, 'Achternaam moet minimaal 2 karakters bevatten'),
// 	email: z.string().email('Voer een geldig e-mailadres in'),
// 	password: z
// 		.string()
// 		.min(8, 'Wachtwoord moet minimaal 8 karakters bevatten')
// 		.regex(/[A-Z]/, 'Wachtwoord moet minimaal 1 hoofdletter bevatten')
// 		.regex(/[0-9]/, 'Wachtwoord moet minimaal 1 cijfer bevatten'),
// 	role: z.enum(['DESIGNER', 'DEVELOPER']),
// });
//
// type SignupValues = z.infer<typeof signupSchema>;
//
// export default function SignupForm() {
// 	const [isSubmitting, setIsSubmitting] = useState(false);
// 	const [formError, setFormError] = useState<string | null>(null);
// 	const [showPassword, setShowPassword] = useState(false);
//
// 	const form = useForm({
// 		defaultValues: {
// 			firstName: '',
// 			lastName: '',
// 			email: '',
// 			password: '',
// 			role: 'DEVELOPER' as const,
// 		},
// 		onSubmit: async ({ value }) => {
// 			setIsSubmitting(true);
// 			setFormError(null);
//
// 			try {
// 				const formData = new FormData();
// 				formData.append('firstName', value.firstName);
// 				formData.append('lastName', value.lastName);
// 				formData.append('email', value.email);
// 				formData.append('password', value.password);
// 				formData.append('role', value.role);
//
// 				// Assuming you have a signUp function defined elsewhere
// 				// await signUp(formData);
// 				console.log('Form submitted:', value);
// 				// After successful redirection, this code shouldn't execute
// 			} catch (error) {
// 				setFormError(
// 					error instanceof Error ? error.message : 'Er is iets misgegaan',
// 				);
// 			} finally {
// 				setIsSubmitting(false);
// 			}
// 		},
// 		validatorAdapter: zodValidator,
// 	});
//
// 	// Password strength function
// 	function getPasswordStrength(password: string): {
// 		score: number;
// 		label: string;
// 	} {
// 		let score = 0;
//
// 		if (password.length >= 8) score++;
// 		if (/[A-Z]/.test(password)) score++;
// 		if (/[0-9]/.test(password)) score++;
// 		if (/[^A-Za-z0-9]/.test(password)) score++;
//
// 		const labels = ['Zwak', 'Redelijk', 'Goed', 'Sterk', 'Uitstekend'];
//
// 		return {
// 			score,
// 			label: labels[score],
// 		};
// 	}
//
// 	return (
// 		<div className={styles.formContainer}>
// 			<form
// 				onSubmit={(e) => {
// 					e.preventDefault();
// 					e.stopPropagation();
// 					form.handleSubmit();
// 				}}
// 			>
// 				<h2>Registreren</h2>
// 				{formError && <div className={styles.error}>{formError}</div>}
// 				<div className={styles.formGroup}>
// 					<label htmlFor="firstName">Voornaam</label>
// 					<form.Field
// 						name="firstName"
// 						validators={[
// 							{
// 								validate: (value) =>
// 									signupSchema.shape.firstName.safeParse(value).success ||
// 									'Ongeldige voornaam',
// 							},
// 						]}
// 					>
// 						{(field) => (
// 							<>
// 								<input
// 									id="firstName"
// 									name="firstName"
// 									value={field.value} // Use field.value instead of field.state.value
// 									onChange={(e) => field.setValue(e.target.value)} // Use field.setValue instead of field.handleChange
// 									onBlur={field.onBlur} // Use field.onBlur instead of field.handleBlur
// 									className={field.errors.length ? styles.inputError : ''}
// 								/>
// 								{field.errors.length > 0 && (
// 									<div className={styles.errorMessage}>
// 										{field.errors[0]} // Use field.errors instead of
// 										field.state.meta.touchedErrors
// 									</div>
// 								)}
// 							</>
// 						)}
// 					</form.Field>
// 				</div>
// 				// Repeat the above steps for lastName, email, password, and role fields
// 				<button
// 					type="submit"
// 					disabled={isSubmitting || !form.formState.isValid} // Use form.formState.isValid instead of form.state.canSubmit
// 					className={styles.submitButton}
// 				>
// 					{isSubmitting ? 'Bezig met registreren...' : 'Registreren'}
// 				</button>
// 			</form>
// 		</div>
// 	);
// }
