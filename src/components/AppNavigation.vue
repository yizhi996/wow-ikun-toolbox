<template>
  <div class="w-full h-full flex items-center space-x-5 mx-5">
    <div
      v-for="menu of menus"
      :key="menu.value"
      class="cursor-pointer text-base font-semibold select-none relative"
      :class="className(menu)"
      @click="onClick(menu.value)"
    >
      <span class="inline-flex min-w-[32px] justify-center">{{ menu.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

interface Menu {
  value: string
  label: string
}

const props = defineProps<{
  menus: Menu[]
}>()

const route = useRoute()

const router = useRouter()

const className = (menu: Menu) => {
  const cls = []
  cls.push(route.path === menu.value ? 'text-accent-500' : 'text-gray-500')
  return cls.join(' ')
}

const onClick = (value: string) => {
  router.push(value)
}
</script>
