import { createApp } from 'vue'
import './assets/css/tailwind.css'
import './assets/css/style.css'
import './assets/css/element'
import router from './router'
import App from './App.vue'
import { ipcRenderer } from 'electron'
import { createPinia } from 'pinia'
import { useStore } from './store'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { IPCChannel } from '~shared'

const pinia = createPinia()

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})

const setup = async () => {
  const store = useStore()

  try {
    const info = await ipcRenderer.invoke(IPCChannel.GET_APP_INFO)
    store.appInfo.paths = info.paths
    store.appInfo.version = info.version
    app.mount('#app').$nextTick(() => {
      postMessage({ payload: 'removeLoading' }, '*')
    })
  } catch (e) {}
}

setup()
