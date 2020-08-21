import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faCog,
  faPlay,
  faPlus,
  faUser,
  faHome,
  faList,
  faCrown,
  faPause,
  faTimes,
  faMusic,
  faClone,
  faEquals,
  faCircle,
  faSearch,
  faSyncAlt,
  faSpinner,
  faForward,
  faHistory,
  faVolumeUp,
  faTrashAlt,
  faHandPaper,
  faVolumeOff,
  faVolumeDown,
  faVolumeMute,
  faPlusCircle,
  faInfoCircle,
  faExchangeAlt,
  faArrowAltCircleUp,
} from '@fortawesome/free-solid-svg-icons';
import { faLine, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';
import VueLazyload from 'vue-lazyload';

// @ts-ignore
import VueScript2 from 'vue-script2';
// @ts-ignore
import Ads from 'vue-google-adsense';

import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';

import firebase from './plugins/firebase';
import logInstaller, { logger } from '@/plugins/logger';

const { initUserInfo, captureException } = logger;

library.add(
  faCog,
  faPlay,
  faPlus,
  faUser,
  faHome,
  faList,
  faCrown,
  faPause,
  faTimes,
  faMusic,
  faClone,
  faEquals,
  faCircle,
  faSearch,
  faSyncAlt,
  faSpinner,
  faForward,
  faHistory,
  faVolumeUp,
  faTrashAlt,
  faHandPaper,
  faVolumeOff,
  faVolumeDown,
  faVolumeMute,
  faPlusCircle,
  faInfoCircle,
  faExchangeAlt,
  faArrowAltCircleUp,
  faLine,
  faTwitter,
);
Vue.component('fa-icon', FontAwesomeIcon);
Vue.component('fa-layers', FontAwesomeLayers);

Vue.use(firebase);
Vue.use(logInstaller);

Vue.use(VueLazyload);
Vue.use(VueScript2);
Vue.use(Ads.Adsense);
Vue.use(Ads.InFeedAdsense);

Vue.config.productionTip = false;

initUserInfo();
// Object.defineProperty(window, 'logger', { value: logger, enumerable: true });

// Vue.config.errorHandler = (err) => {
//   captureException(err);
// };

// Vue.config.warnHandler = (message) => {
//   captureException(new Error(message));
// };

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
