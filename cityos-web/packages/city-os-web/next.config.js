const { DefinePlugin } = require('webpack');
const withTM = require('next-transpile-modules')(['city-os-common']);

module.exports = withTM({
  trailingSlash: true,
  /**
   * @param {import('webpack').WebpackOptionsNormalized} config
   * @returns {import('webpack').WebpackOptionsNormalized}
   */
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [
                {
                  removeViewBox: false,
                },
              ],
            },
          },
        },
      ],
    });
    config.plugins.push(
      new DefinePlugin({
        D_DEBUG: JSON.stringify(process.env.NODE_ENV === 'development'),
        D_TEST: JSON.stringify(process.env.NODE_ENV === 'test'),
      }),
    );

    return config;
  },
  images: {
    deviceSizes: [320, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  experimental: {
    externalDir: true,
  },
});
