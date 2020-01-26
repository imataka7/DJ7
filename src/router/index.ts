import Vue from 'vue';
import VueRouter from 'vue-router';
import Hub from '../views/Hub.vue';
import General from '../views/General.vue';
import { app as firebase } from '@/plugins/firebase';
import { user } from '@/store/modules';

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
    // eslint-disable-next-line
    firebase.auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        user.init(firebaseUser);
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
