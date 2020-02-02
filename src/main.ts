import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faPlay,
  faPause,
  faForward,
  faVolumeMute,
  faVolumeUp,
  faVolumeDown,
  faVolumeOff,
  faSpinner,
  faCog,
  faArrowAltCircleUp,
  faExchangeAlt,
  faTrashAlt,
  faTimes,
  faPlus,
  faCircle,
  faHandPaper,
} from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';
import VueLazyload from 'vue-lazyload';

import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';

import firebase from './plugins/firebase';

library.add(...[
  faPlay,
  faPause,
  faForward,
  faVolumeMute,
  faVolumeUp,
  faVolumeDown,
  faVolumeOff,
  faSpinner,
  faCog,
  faArrowAltCircleUp,
  faExchangeAlt,
  faTrashAlt,
  faTimes,
  faPlus,
  faCircle,
  faHandPaper,
  faTwitter,
]);
Vue.component('fa-icon', FontAwesomeIcon);
Vue.component('fa-layers', FontAwesomeLayers);

Vue.use(VueLazyload);
Vue.use(firebase);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
