import Vue from 'vue';
import VueRouter from 'vue-router';
import Hub from '../views/Hub.vue';
import { app as firebase } from '@/plugins/firebase';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'landing',
    redirect: '/debug',
    meta: {
      requreAuth: true,
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
  },
  {
    path: '/:roomId',
    name: 'hub',
    component: Hub,
    meta: {
      requreAuth: true,
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
  const isReqiredAuth = to.matched.some(r => r.meta.requreAuth);

  if (isReqiredAuth) {
    // eslint-disable-next-line
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        next();
      } else {
        next({
          path: '/signin',
        });
      }
    });
  } else {
    next();
  }
});

export default router;
