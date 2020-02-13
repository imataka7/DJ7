process.env.VUE_APP_VERSION = 'v0.25.9 on 20200213';

const manifestJSON = require('./public/manifest.json');

const pwaArgs = {
  themeColor: manifestJSON.theme_color,
  name: manifestJSON.short_name,
  msTileColor: manifestJSON.background_color,
};

const dist = `${__dirname}/dist`;

module.exports = {
  productionSourceMap: process.env.NODE_ENV !== 'production',
  chainWebpack: (config) => {
    config.plugin('pwa').tap(() => [pwaArgs]);
  },
  pwa: {
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      swDest: `${dist}/service-worker.js`,
      skipWaiting: true,
      clientsClaim: true,
      exclude: ['ads.txt', /.+png/],
      navigateFallback: '/index.html',
      runtimeCaching: [
        {
          handler: 'StaleWhileRevalidate',
          urlPattern: /^https:\/\/fonts\.googleapis\.com/,
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
          urlPattern: /\/img\/.+/,
          options: {
            cacheName: 'dj7-images',
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
          },
        },
        {
          handler: 'CacheFirst',
          urlPattern: /.+\.(?:png|gif|jpg|jpeg|webp|svg)$/,
          options: {
            cacheName: 'third-party-images',
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 7,
            },
          },
        },
        // {
        //   handler: 'StaleWhileRevalidate',
        //   urlPattern: /.+\.(?:js|css)$/,
        //   options: {
        //     cacheName: 'third-party-resources',
        //   },
        // },
      ],
    },
  },
};
