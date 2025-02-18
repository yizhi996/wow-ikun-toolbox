import { createRouter, createWebHistory } from 'vue-router'

import WTF from '~/pages/wtf.vue'
import Account from '~/pages/account.vue'
import Settings from '~/pages/settings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/:pathMatch(.*)*', redirect: '/wtf' },
    { path: '/wtf', name: '配置管理', component: WTF, meta: { keepAlive: true } },
    { path: '/account', name: '账号切换', component: Account },
    { path: '/settings', name: '设置', component: Settings }
  ]
})

export default router
