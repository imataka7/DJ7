import Vue from 'vue';
import VueRouter from 'vue-router';
import { Hub, Admin, Documents } from '@/views';
import { app as firebase } from '@/plugins/firebase';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: 'general',
  },
  {
    path: '/signin',
    name: 'signin',
    component: () => import(/* webpackChunkName: "signin" */ '../views/Signin.vue'),
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
    path: '/docs',
    name: 'docs',
    component: Documents,
  },
  {
    path: '/general',
    name: 'hub-general',
    component: Hub,
  },
  {
    path: '/:roomId',
    name: 'hub',
    component: Hub,
    // meta: {
    //   authRequired: true,
    // },
  },
  {
    path: '/:roomId/admin',
    name: 'admin',
    component: Admin,
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
