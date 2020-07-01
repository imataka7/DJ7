/* eslint-disable no-console */

import { register, Hooks } from 'register-service-worker';
import Swal from 'sweetalert2';

const confirmReloading = () => {
  return Swal.fire({
    text: '最新版があります。更新して今すぐ使おう🤟🏻',
    toast: true,
    confirmButtonText: '更新',
    position: 'bottom-right',
  });
};

const path = `${process.env.BASE_URL}service-worker.js`;

const hooks: Hooks = {
  ready() {
    console.log(
      'App is being served from cache by a service worker.\n'
      + 'For more details, visit https://goo.gl/AFskqB',
    );
  },
  registered() {
    console.log('Service worker has been registered.');
  },
  cached() {
    console.log('Content has been cached for offline use.');
  },
  updatefound() {
    console.log('New content is downloading.');
  },
  updated() {
    console.log('New content is available; please refresh.');
    confirmReloading().then(() => window.location.reload());
  },
  offline() {
    console.log(
      'No internet connection found. App is running in offline mode.',
    );
  },
  error(error) {
    console.error('Error during service worker registration:', error);
  },
};

if (process.env.NODE_ENV === 'production') {
  register(path, hooks);
}
