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
import Layout from './layout/Layout.vue'
</script>
