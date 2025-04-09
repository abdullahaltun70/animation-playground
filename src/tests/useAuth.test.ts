import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useAuth } from '@/app/(auth)/hooks/useAuth';

import { mocks } from '../../jest.setup';
const { mockPush, mockSignInWithPassword } = mocks;

describe('useAuth', () => {
	// Test successful authentication
	it('should authenticate user and redirect to profile when credentials are valid', async () => {
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			await result.current.handleSignIn({
				email: 'test@example.com',
				password: 'password123',
			});
		});

		expect(mockSignInWithPassword).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'password123',
		});
		expect(mockPush).toHaveBeenCalledWith('/profile');
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBeNull();
	});

	// Test invalid credentials
	it('should set error message when credentials are invalid', async () => {
		// Mock console.error to prevent test output pollution
		jest.spyOn(console, 'error').mockImplementation(() => {});

		const { result } = renderHook(() => useAuth());

		await act(async () => {
			await result.current.handleSignIn({
				email: 'wrong@example.com',
				password: 'wrongpassword',
			});
		});

		expect(mockSignInWithPassword).toHaveBeenCalledWith({
			email: 'wrong@example.com',
			password: 'wrongpassword',
		});
		expect(mockPush).not.toHaveBeenCalled();
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBe('Invalid email or password.');
	});
});
