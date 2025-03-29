import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
			},
		],
	},
	typescript: {
		// Ignore type check during build, already performed as part of the CI/CD pipeline
		ignoreBuildErrors: true,
	},
};

export default nextConfig;
