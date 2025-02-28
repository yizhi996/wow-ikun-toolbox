import { createRouter, createWebHistory } from 'vue-router'
import { App } from 'vue'

import WTF from '~/pages/wtf.vue'
import Account from '~/pages/account.vue'
import Settings from '~/pages/settings.vue'

import {
  Setting as ElIconSetting,
  Switch as ElIconSwitch,
  Files as ElIconFiles
} from '@element-plus/icons-vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/:pathMatch(.*)*', redirect: '/wtf' },
    {
      path: '/wtf',
      name: '配置管理',
      component: WTF,
      meta: { keepAlive: true, icon: 'ElIconFiles' }
    },
    { path: '/account', name: '账号切换', component: Account, meta: { icon: 'ElIconSwitch' } },
    {
      path: '/settings',
      name: '设置',
      component: Settings,
      meta: { icon: 'ElIconSetting' }
    }
  ]
})

const oldInstall = router.install
router.install = (app: App) => {
  oldInstall.call(router, app)

  app.component('ElIconFiles', ElIconFiles)
  app.component('ElIconSetting', ElIconSetting)
  app.component('ElIconSwitch', ElIconSwitch)
}

export default router
