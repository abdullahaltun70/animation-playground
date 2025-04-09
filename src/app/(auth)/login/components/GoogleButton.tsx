import React from 'react';

import { Button } from '@radix-ui/themes';
import Image from 'next/image';

import styles from '../styles/components.module.scss';

interface AuthButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	loading?: boolean;
}

const GoogleButton: React.FC<AuthButtonProps> = ({ onClick, loading }) => (
	<Button
		variant="outline"
		onClick={onClick}
		disabled={loading}
		className={styles.googleButton}
	>
		<Image
			src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
			alt="Google"
			width="18"
			height="18"
			className={styles.googleIcon}
		/>
		Sign in with Google
	</Button>
);

export default GoogleButton;
