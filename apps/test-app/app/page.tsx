import styles from "./page.module.scss";

const FEATURES = [
	{
		emoji: "🔒",
		title: "Secure by default",
		description:
			"The devcontainer locks down git push and SSH agent forwarding so Claude can read your codebase freely — but can never write to the remote without your review.",
	},
	{
		emoji: "🧠",
		title: "Persistent context",
		description:
			"Memory and plans are git-tracked and survive container rebuilds. Claude remembers your project, preferences, and in-progress work across every session.",
	},
	{
		emoji: "🐙",
		title: "GitHub via fine-grained PAT",
		description:
			"The gh CLI is pre-installed and scoped to a single-repo token you control. Claude can open PRs and check CI — how much you delegate is up to you.",
	},
];

const STACK = ["Node.js", "TypeScript", "PNPM Workspaces", "Turborepo", "Vitest", "Next.js", "React", "SCSS Modules"];

export default function Home() {
	return (
		<main className={styles.page}>
			<div className={styles.content}>
				<div className={styles.header}>
					<p className={styles.eyebrow}>GitHub Template</p>
					<h1 className={styles.title}>monorepo-starter</h1>
					<p className={styles.tagline}>
						A TypeScript monorepo with an opinionated, security-conscious <strong>Claude Code</strong> integration built
						in — not bolted on.
					</p>
				</div>

				<ul className={styles.features}>
					{FEATURES.map((f) => (
						<li key={f.title} className={styles.feature}>
							<h2 className={styles.featureTitle}>
								<span className={styles.featureEmoji}>{f.emoji}</span>
								{f.title}
							</h2>
							<p className={styles.featureDescription}>{f.description}</p>
						</li>
					))}
				</ul>

				<div className={styles.stackRow}>
					<span className={styles.stackLabel}>Stack</span>
					<ul className={styles.stack}>
						{STACK.map((item) => (
							<li key={item} className={styles.badge}>
								{item}
							</li>
						))}
					</ul>
				</div>

				<div className={styles.actions}>
					<a href="https://github.com/JDBar/monorepo-starter" className={styles.buttonPrimary}>
						Use this template
					</a>
					<a
						href="https://github.com/JDBar/monorepo-starter/blob/main/docs/setup.md"
						className={styles.buttonSecondary}
					>
						Setup guide →
					</a>
				</div>
			</div>
		</main>
	);
}
