<template>
  <Layout>
    <RouterView v-slot="{ Component }">
      <keep-alive include="wtf">
        <component :is="Component" :key="$route.fullPath" />
      </keep-alive>
    </RouterView>
  </Layout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Layout from './layout/Layout.vue'
import { useStore } from './store'

const store = useStore()

onMounted(() => {
  if (!store.checkWoWExists()) {
    store.showWowDirSetAlert()
  }
})
</script>
