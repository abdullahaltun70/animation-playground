// app/(main)/profile/page.tsx
import styles from './page.module.scss';

export default function Profile() {
	return (
		<div className={styles.container}>
			<h1>Profiel</h1>
			<div className={styles.profileSection}>
				{/* Profiel instellingen, opgeslagen animaties, etc. */}
			</div>
		</div>
	);
}
