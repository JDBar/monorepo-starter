import styles from "./page.module.scss";

const KANDINSKY = {
	red: "#C1392B",
	blue: "#1B4FBB",
	yellow: "#F7C52B",
};

const FEATURES = [
	{
		emoji: "🔒",
		title: "Secure by default",
		color: KANDINSKY.red,
		description:
			"The devcontainer locks down git push and SSH agent forwarding so Claude can read your codebase freely — but can never write to the remote without your review.",
	},
	{
		emoji: "🧠",
		title: "Persistent context",
		color: KANDINSKY.blue,
		description:
			"Memory and plans are git-tracked and survive container rebuilds. Claude remembers your project, preferences, and in-progress work across every session.",
	},
	{
		emoji: "🐙",
		title: "GitHub via fine-grained PAT",
		color: KANDINSKY.yellow,
		description:
			"The gh CLI is pre-installed and scoped to a single-repo token you control. Claude can open PRs and check CI — how much you delegate is up to you.",
	},
];

const STACK = ["Node.js", "TypeScript", "PNPM Workspaces", "Turborepo", "Vitest", "Next.js", "React", "SCSS Modules"];

function GeometricBackground() {
	return (
		<svg className={styles.geo} viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			{/* Large cobalt blue circle — top right, mostly off-screen */}
			<circle cx="1210" cy="-60" r="300" fill={KANDINSKY.blue} opacity="0.12" />

			{/* Medium yellow circle — left side */}
			<circle cx="-40" cy="380" r="160" fill={KANDINSKY.yellow} opacity="0.2" />

			{/* Red triangle — bottom left */}
			<polygon points="0,800 220,800 0,560" fill={KANDINSKY.red} opacity="0.13" />

			{/* Small red circle — top left accent */}
			<circle cx="120" cy="100" r="40" fill={KANDINSKY.red} opacity="0.18" />

			{/* Thin diagonal lines */}
			<line x1="0" y1="240" x2="320" y2="520" stroke="#171717" strokeWidth="1.5" opacity="0.07" />
			<line x1="1280" y1="200" x2="960" y2="520" stroke="#171717" strokeWidth="1.5" opacity="0.07" />

			{/* Small yellow square — bottom right accent */}
			<rect
				x="1160"
				y="680"
				width="80"
				height="80"
				fill={KANDINSKY.yellow}
				opacity="0.2"
				transform="rotate(15 1200 720)"
			/>
		</svg>
	);
}

export default function Home() {
	return (
		<main className={styles.page}>
			<GeometricBackground />
			<div className={styles.content}>
				<div className={styles.header}>
					<p className={styles.eyebrow}>GitHub Template</p>
					<h1 className={styles.title}>
						<span className={styles.titleHighlight}>monorepo-starter</span>
					</h1>
					<p className={styles.tagline}>
						A TypeScript monorepo with an opinionated, security-conscious <strong>Claude Code</strong> integration built
						in — not bolted on.
					</p>
				</div>

				<ul className={styles.features}>
					{FEATURES.map((f) => (
						<li key={f.title} className={styles.feature} style={{ "--feature-color": f.color } as React.CSSProperties}>
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
