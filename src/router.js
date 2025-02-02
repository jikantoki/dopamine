import { createRouter, createWebHistory } from 'vue-router'
import indexPage from './views/indexPage.vue'
import subPage from './views/subPage.vue'

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: indexPage,
    },
    {
      path: '/sub',
      name: 'sub',
      component: subPage,
    },
  ],
})

export default router
