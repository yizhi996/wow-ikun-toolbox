import { createApp } from 'vue'
import './assets/css/tailwind.css'
import './assets/css/style.css'
import router from './router'
import App from './App.vue'
import { Setting } from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/notification/style/css'
import 'element-plus/es/components/table/style/css'
import 'element-plus/es/components/option/style/css'
import { ipcRenderer } from 'electron'
import { createPinia } from 'pinia'
import { useStore } from './store'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const pinia = createPinia()

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})
app.component('ElIconSetting', Setting)

const setup = async () => {
  const store = useStore()

  try {
    const info = await ipcRenderer.invoke('get-app-info')
    store.appInfo.paths = info.paths
    store.appInfo.version = info.version
    app.mount('#app').$nextTick(() => {
      postMessage({ payload: 'removeLoading' }, '*')
    })
  } catch (e) {
    
  }
}

setup()
