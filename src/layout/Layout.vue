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
import { ref } from 'vue'

const menus = ref([
  { value: '/wtf', label: '配置管理' },
  { value: '/settings', label: '设置' }
])
</script>
