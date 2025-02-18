<template>
  <div class="w-full h-full relative overflow-hidden">
    <AppHeader :class="'h-14'">
      <div class="flex items-center h-14">
        <AppNavigation :menus="menus"></AppNavigation>
      </div>
    </AppHeader>
    <AppMain :class="'h-[calc(100vh-56px)]'">
      <slot></slot>
    </AppMain>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../components/Layout/AppHeader.vue'
import AppMain from '../components/Layout/AppMain.vue'
import AppNavigation from '../components/AppNavigation.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const menus = router
  .getRoutes()
  .filter(route => route.name)
  .map(route => {
    return { value: route.path, label: route.name as string }
  })
</script>
