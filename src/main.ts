import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faPlay, faPause, faForward, faVolumeMute, faVolumeUp, faVolumeDown, faVolumeOff, faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';

import firebase from './plugins/firebase';

library.add(...[
  faPlay, faPause, faForward, faVolumeMute, faVolumeUp, faVolumeDown, faVolumeOff, faSpinner,
]);
Vue.component('fa-icon', FontAwesomeIcon);

Vue.use(firebase);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
