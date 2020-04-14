const WebpackBar = require('webpackbar');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// https://git.io/JfeJM
module.exports = {
  webpack: {
    plugins: [
      new WebpackBar({ profile: true }),
      ...(process.env.NODE_ENV === 'development'
        ? [new BundleAnalyzerPlugin({ openAnalyzer: false })]
        : []),
    ],
  },
  jest: {
    configure: {
      moduleNameMapper: {
        'worker-loader!../worker': '<rootDir>/src/worker.ts',
      },
      collectCoverage: true,
      coverageReporters: ['json'],
    },
  },
};
