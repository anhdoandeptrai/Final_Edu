/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Completely externalize TensorFlow and MediaPipe to avoid build errors
    config.externals = config.externals || [];
    config.externals.push({
      '@mediapipe/pose': 'commonjs @mediapipe/pose',
      '@tensorflow-models/pose-detection': 'commonjs @tensorflow-models/pose-detection',
      '@tensorflow/tfjs-core': 'commonjs @tensorflow/tfjs-core',
      '@tensorflow/tfjs': 'commonjs @tensorflow/tfjs',
      '@tensorflow/tfjs-backend-webgl': 'commonjs @tensorflow/tfjs-backend-webgl',
      '@tensorflow/tfjs-backend-webgpu': 'commonjs @tensorflow/tfjs-backend-webgpu',
      '@tensorflow/tfjs-converter': 'commonjs @tensorflow/tfjs-converter',
    });

    // Add fallbacks for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    return config;
  },
  // Transpile packages that need it
  transpilePackages: [
    '@tensorflow/tfjs',
    '@tensorflow/tfjs-core',
    '@tensorflow/tfjs-backend-webgl',
    '@tensorflow-models/pose-detection',
  ],
}

module.exports = nextConfig
