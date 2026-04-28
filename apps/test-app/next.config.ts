import type { NextConfig } from "next";

const CACHE_TTL = {
	ONE_SECOND: 1,
	ONE_MINUTE: 60,
	ONE_HOUR: 3600,
	ONE_DAY: 86400,
	ONE_WEEK: 604800,
	ONE_MONTH: 2628000,
	ONE_YEAR: 31536000,
};

const nextConfig: NextConfig = {
	output: "export",
	compress: true,
	trailingSlash: true,

	// Cloudflare will cache images for us, so we don't need to optimize them.
	images: {
		minimumCacheTTL: CACHE_TTL.ONE_YEAR,
		unoptimized: true,
	},
};

export default nextConfig;
