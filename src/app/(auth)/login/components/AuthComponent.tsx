'use client';

import React, { useEffect, useState } from 'react';

import * as Form from '@radix-ui/react-form';
import { Button, Flex, Link as RadixLink, Text } from '@radix-ui/themes';
import { useForm } from 'react-hook-form';

import {
  SignInFormData,
  SignUpFormData,
  useAuth,
} from '@/app/(auth)/hooks/useAuth';
import GoogleButton from '@/app/(auth)/login/components/GoogleButton';

import AlertNotification from './AlertComponent';
import styles from '../styles/components.module.scss';

enum AuthView {
  SIGN_IN,
  SIGN_UP,
  FORGOT_PASSWORD,
}

interface AuthLinkProps {
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  children: React.ReactNode;
}

const AuthLink: React.FC<AuthLinkProps> = ({ onClick, children }) => (
  <RadixLink href="#" size="2" onClick={onClick} className={styles.link}>
    {children}
  </RadixLink>
);

interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}
const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  loading,
  ...props
}) => (
  <Button
    disabled={loading}
    {...props}
    className={styles.submitButton}
    type={'submit'}
    color={'indigo'}
  >
    {loading ? 'Processing...' : children}
  </Button>
);

const AuthComponent: React.FC = () => {
  // Use custom hook to get state and actions
  const {
    loading,
    error,
    showAlert,
    alertTitle,
    alertMessage,
    setError,
    setShowAlert,
    handleGoogleSignIn,
    handleSignIn,
    handleSignUp,
    handlePasswordReset,
  } = useAuth();

  const [view, setView] = useState<AuthView>(AuthView.SIGN_IN);

  const signInForm = useForm<SignInFormData>();
  const signUpForm = useForm<SignUpFormData>();
  const forgotPasswordForm = useForm<{ email: string }>();

  // Reset error and form state on view change (and form reset)
  useEffect(() => {
    setError(null);
    signInForm.reset();
    signUpForm.reset();
    forgotPasswordForm.reset();
  }, [view, setError, signInForm, signUpForm, forgotPasswordForm]);

  // Async handlers for form submissions

  const onSignUpSubmit = async (data: SignUpFormData) => {
    const success = await handleSignUp(data);
    try {
      if (success) {
        setView(AuthView.SIGN_IN);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(`On Submit error: ${err.message}`);
        setError(err.message);
      } else {
        console.log('On Submit error:', err);
        setError('An unknown error occurred');
      }
    }
  };

  const onPasswordResetSubmit = async (data: { email: string }) => {
    const success = await handlePasswordReset(data);
    if (success) {
      setView(AuthView.SIGN_IN);
    }
  };

  const renderSignInForm = () => (
    <>
      <GoogleButton onClick={handleGoogleSignIn} loading={loading} />
      <div className={styles.divider}>OR</div>
      <Form.Root
        onSubmit={signInForm.handleSubmit(handleSignIn)}
        className={styles.formRoot}
      >
        <Form.Field name="email" className={styles.formField}>
          <Form.Label className={styles.formLabel}>Email address</Form.Label>
          <Form.Control asChild>
            <input
              className={styles.formInput}
              type="email"
              placeholder="Your email address"
              required
              {...signInForm.register('email', { required: true })}
            />
          </Form.Control>
          <Form.Message match="valueMissing" className={styles.errorMessage}>
            Email is required
          </Form.Message>
          <Form.Message match="typeMismatch" className={styles.errorMessage}>
            Please enter a valid email
          </Form.Message>
        </Form.Field>

        <Form.Field name="password" className={styles.formField}>
          <Form.Label className={styles.formLabel}>Your Password</Form.Label>
          <Form.Control asChild>
            <input
              className={styles.formInput}
              type="password"
              placeholder="Your password"
              required
              {...signInForm.register('password', { required: true })}
            />
          </Form.Control>
          <Form.Message match="valueMissing" className={styles.errorMessage}>
            Password is required
          </Form.Message>
        </Form.Field>

        {error && (
          <Text size="2" color="red" className={styles.errorMessage}>
            {error}
          </Text>
        )}

        <Form.Submit asChild>
          <AuthButton type="submit" loading={loading}>
            Sign in
          </AuthButton>
        </Form.Submit>
      </Form.Root>
      <Flex direction="column" gap="2" align="center" mt="4">
        <AuthLink onClick={() => setView(AuthView.FORGOT_PASSWORD)}>
          Forgot your password?
        </AuthLink>
        <AuthLink onClick={() => setView(AuthView.SIGN_UP)}>
          Don&#39;t have an account? Sign up
        </AuthLink>
      </Flex>
    </>
  );

  const renderSignUpForm = () => (
    <>
      <GoogleButton onClick={handleGoogleSignIn} loading={loading} />
      <div className={styles.divider}>OR</div>
      <Form.Root
        onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}
        className={styles.formRoot}
      >
        <Form.Field name="email" className={styles.formField}>
          <Form.Label className={styles.formLabel}>Email address</Form.Label>
          <Form.Control asChild>
            <input
              className={styles.formInput}
              type="email"
              placeholder="Your email address"
              required
              {...signUpForm.register('email', {
                required: 'Email is required',
              })}
            />
          </Form.Control>
          <Form.Message match="valueMissing" className={styles.errorMessage}>
            Email is required
          </Form.Message>
          <Form.Message match="typeMismatch" className={styles.errorMessage}>
            Please enter a valid email
          </Form.Message>
        </Form.Field>

        {signUpForm.formState.errors.email && (
          <Text size="2" color="red" className={styles.errorMessage}>
            {signUpForm.formState.errors.email.message}
          </Text>
        )}

        <Form.Field name="password" className={styles.formField}>
          <Form.Label className={styles.formLabel}>
            Create a Password
          </Form.Label>
          <Form.Control asChild>
            <input
              className={styles.formInput}
              type="password"
              placeholder="Your password"
              required
              {...signUpForm.register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
          </Form.Control>
          <Form.Message match="valueMissing" className={styles.errorMessage}>
            Password is required
          </Form.Message>
        </Form.Field>

        {signUpForm.formState.errors.password && (
          <Text size="2" color="red" className={styles.errorMessage}>
            {signUpForm.formState.errors.password.message}
          </Text>
        )}

        {error &&
          !signUpForm.formState.errors.email &&
          !signUpForm.formState.errors.password && (
            <Text size="2" color="red" className={styles.errorMessage}>
              {error}
            </Text>
          )}

        <Form.Submit asChild>
          <AuthButton type="submit" loading={loading}>
            Sign up
          </AuthButton>
        </Form.Submit>
      </Form.Root>

      <Flex direction="column" gap="2" align="center" mt="4">
        <AuthLink onClick={() => setView(AuthView.SIGN_IN)}>
          Already have an account? Sign in
        </AuthLink>
      </Flex>
    </>
  );

  const renderForgotPasswordForm = () => (
    <>
      <Text size="2" color="gray" align="center" mb="4">
        Enter your email address and we&#39;ll send you instructions to reset
        your password.
      </Text>
      <Form.Root
        onSubmit={forgotPasswordForm.handleSubmit(onPasswordResetSubmit)}
        className={styles.formRoot}
      >
        <Form.Field name="email" className={styles.formField}>
          <Form.Label className={styles.formLabel}>Email address</Form.Label>
          <Form.Control asChild>
            <input
              className={styles.formInput}
              type="email"
              placeholder="Your email address"
              required
              {...forgotPasswordForm.register('email', {
                required: 'Email is required',
              })}
            />
          </Form.Control>
          <Form.Message match="valueMissing" className={styles.errorMessage}>
            Email is required
          </Form.Message>
          <Form.Message match="typeMismatch" className={styles.errorMessage}>
            Please enter a valid email
          </Form.Message>
        </Form.Field>

        {forgotPasswordForm.formState.errors.email && (
          <Text size="2" color="red" className={styles.errorMessage}>
            {forgotPasswordForm.formState.errors.email.message}
          </Text>
        )}

        {error && !forgotPasswordForm.formState.errors.email && (
          <Text size="2" color="red" className={styles.errorMessage}>
            {error}
          </Text>
        )}

        <Form.Submit asChild>
          <AuthButton type="submit" loading={loading}>
            Send reset instructions
          </AuthButton>
        </Form.Submit>
      </Form.Root>

      <Flex direction="column" gap="2" align="center" mt="4">
        <AuthLink onClick={() => setView(AuthView.SIGN_IN)}>
          Back to Sign in
        </AuthLink>
      </Flex>
    </>
  );

  return (
    <>
      {view === AuthView.SIGN_IN && renderSignInForm()}
      {view === AuthView.SIGN_UP && renderSignUpForm()}
      {view === AuthView.FORGOT_PASSWORD && renderForgotPasswordForm()}
      <AlertNotification
        showAlert={showAlert}
        setShowAlert={setShowAlert}
        alertTitle={alertTitle}
        alertMessage={alertMessage}
        onConfirm={() => setShowAlert(false)}
      />
    </>
  );
};

export default AuthComponent;
