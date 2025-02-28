<template>
  <div class="w-full h-full relative overflow-hidden flex select-none">
    <div class="flex items-center w-24 f-full flex-shrink-0">
      <AppNavigation :menus="menus"></AppNavigation>
    </div>
    <div>
      <div :class="'w-[calc(100vw-96px)] h-screen'">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppNavigation from '../components/AppNavigation.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const menus = router
  .getRoutes()
  .filter(route => route.name)
  .map(route => {
    return {
      value: route.path,
      label: route.name! as string,
      icon: route.meta.icon as string
    }
  })
</script>
