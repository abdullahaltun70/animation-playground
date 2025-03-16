import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
	sassOption: {
		implementation: 'sass-embedded',
	},
	typescript: {
		// Ignore type check during build, already performed as part of the CI/CD pipeline
		ignoreBuildErrors: true,
	},
	sassOptions: {
		includePaths: [path.join(__dirname, 'src/styles')],
	},
};

export default nextConfig;
