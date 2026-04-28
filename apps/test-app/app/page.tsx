import styles from "./page.module.scss";

export default function Home() {
	return (
		<div className={styles.hello}>
			<h1>Test App</h1>
			<p>A test application.</p>
		</div>
	);
}
