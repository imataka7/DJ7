process.env.VUE_APP_VERSION = 'v0.23.7 on 20200205';

const manifestJSON = require('./public/manifest.json');

const pwaArgs = {
  themeColor: manifestJSON.theme_color,
  name: manifestJSON.short_name,
  msTileColor: manifestJSON.background_color,
};

const dist = `${__dirname}/dist`;

module.exports = {
  pwa: {
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      swDest: `${dist}/service-worker.js`,
      skipWaiting: true,
      clientsClaim: true,
      runtimeCaching: [
        {
          handler: 'NetworkFirst',
          urlPattern: /.+(\.html|\/)$/,
          options: {
            cacheName: 'dj7-index',
            expiration: {
              maxAgeSeconds: 60 * 60 * 24,
            },
          },
        },
        {
          handler: 'StaleWhileRevalidate',
          urlPattern: /^https:\/\/fonts\.google\.com/,
          options: {
            cacheName: 'google-fonts-stylesheets',
          },
        },
        {
          handler: 'CacheFirst',
          urlPattern: /^https:\/\/fonts\.gstatic\.com/,
          options: {
            cacheName: 'google-fonts-webfonts',
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
          },
        },
        {
          handler: 'StaleWhileRevalidate',
          urlPattern: /favicon-.+-\.png/,
          options: {
            cacheName: 'dj7-favicon',
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
          },
        },
      ],
    },
  },
  chainWebpack: (config) => {
    config.plugin('pwa').tap(() => [pwaArgs]);
  },
};
