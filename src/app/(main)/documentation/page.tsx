// app/(main)/documentation/page.tsx
import { Suspense } from 'react';

import styles from './page.module.scss';

export default function Documentation() {
	return (
		<Suspense fallback={'Loading...'}>
			<div className={styles.container}>
				<h1>Documentatie</h1>
				<div className={styles.docs}>{/* Documentatie inhoud */}</div>
			</div>
		</Suspense>
	);
}
