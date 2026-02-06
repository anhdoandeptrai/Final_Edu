/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Don't bundle these on server-side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@mediapipe/tasks-vision': 'commonjs @mediapipe/tasks-vision',
        '@tensorflow-models/pose-detection': 'commonjs @tensorflow-models/pose-detection',
        '@tensorflow/tfjs': 'commonjs @tensorflow/tfjs',
      });
    }

    // Add fallbacks for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      buffer: false,
      util: false,
    };

    return config;
  },
}

module.exports = nextConfig
