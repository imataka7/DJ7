import Vue from 'vue';
import VueRouter from 'vue-router';
import {Hub} from '@/views';
import General from '../views/General.vue';
import {app as firebase} from '@/plugins/firebase';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'general',
    component: General,
    meta: {
      requireAuth: true,
    },
  },
  {
    path: '/signin',
    name: 'signin',
    component: () => import(/* webpackChunkName: "signin" */ '../views/Signin.vue'),
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
    meta: {
      authRequired: true,
    },
  },
  {
    path: '/terms-of-service',
    name: 'tos',
    component: () => import(/* webpackChunkName: "tos" */ '../views/Tos.vue'),
  },
  {
    path: '/privacy-policy',
    name: 'pp',
    component: () => import(/* webpackChunkName: "pp" */ '../views/Privacy.vue'),
  },
  {
    path: '/:roomId',
    name: 'hub',
    component: Hub,
    alias: '/:roomId/req',
    meta: {
      authRequired: true,
    },
  },
  {
    path: '*',
    redirect: '/',
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthRequired = to.matched.some(r => r.meta.authRequired);

  if (isAuthRequired) {
    firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        next();
      } else {
        next({
          path: '/signin',
          query: {
            redirect: to.fullPath,
          },
        });
      }
    });
  } else {
    next();
  }
});

export default router;
