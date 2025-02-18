import { createRouter, createWebHistory } from 'vue-router'

import WTF from '~/pages/wtf.vue'
import Settings from '~/pages/settings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/:pathMatch(.*)*', redirect: '/wtf' },
    { path: '/wtf', component: WTF, meta: { keepAlive: true } },
    { path: '/settings', component: Settings }
  ]
})

export default router
