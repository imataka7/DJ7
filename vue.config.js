process.env.VUE_APP_VERSION = 'v0.22.4 on 20200202';

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
