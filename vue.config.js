process.env.VUE_APP_VERSION = 'v0.21.6 on 20200201';

const manifestJSON = require('./public/manifest.json');

pwaArgs = {
  themeColor: manifestJSON.theme_color,
  name: manifestJSON.short_name,
  msTileColor: manifestJSON.background_color,
};

module.exports = {
  chainWebpack: (config) => {
    config.plugin('pwa').tap(() => [pwaArgs]);
  },
};
