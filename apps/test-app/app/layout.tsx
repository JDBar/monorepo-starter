import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const title = "Test App";
const description = "A test application.";
const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans" });
const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono" });

export const metadata: Metadata = {
	metadataBase: new URL("https://example.com"),
	title,
	description,
	alternates: { canonical: "/" },
	openGraph: {
		type: "website",
		url: "https://example.com/",
		title,
		description,
		images: ["/og.png"],
	},
	twitter: {
		card: "summary_large_image",
		title,
		description,
		images: ["/og.png"],
	},
	icons: {
		icon: "/favicon.ico",
		apple: "/apple-icon.png",
	},
};

export const viewport: Viewport = {
	themeColor: "#000000",
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta name="apple-mobile-web-app-title" content="Test App" />
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
		</html>
	);
}

export const dynamic = "error";
