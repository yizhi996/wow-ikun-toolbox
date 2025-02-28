<template>
  <div class="w-full h-full flex flex-col border-r-[1px] border-white border-opacity-20">
    <div
      v-for="menu of menus"
      :key="menu.value"
      class="cursor-pointer font-semibold select-none w-full h-20 flex flex-col items-center justify-center hover:bg-brown-900"
      :class="className(menu)"
      @click="onClick(menu.value)"
    >
      <component :is="menu.icon" class="w-6 h-6"></component>
      <span class="mt-2 text-sm">{{ menu.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

interface Menu {
  value: string
  label: string
  icon: string
}

const props = defineProps<{
  menus: Menu[]
}>()

const route = useRoute()

const router = useRouter()

const className = (menu: Menu) => {
  const cls = []
  cls.push(route.path === menu.value ? 'text-accent-500 bg-brown-900' : 'text-gray-500 bg-none')
  return cls.join(' ')
}

const onClick = (value: string) => {
  router.push(value)
}
</script>
