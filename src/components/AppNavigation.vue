<template>
  <div class="w-full h-full flex items-center space-x-5 mx-5">
    <div
      v-for="menu of menus"
      :key="menu.value"
      class="cursor-pointer text-base font-semibold select-none"
      :class="className(menu)"
      @click="onClick(menu.value)"
    >
      <span v-if="menu.label" class="inline-flex min-w-[32px] justify-center">{{
        menu.label
      }}</span>
      <component v-else-if="menu.icon" :is="menu.icon" class="w-6 h-6"></component>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

interface Menu {
  value: string
  label?: string
  icon?: string
  position?: string
}

const props = defineProps<{
  menus: Menu[]
}>()

const route = useRoute()

const router = useRouter()

const className = (menu: Menu) => {
  const cls = []
  cls.push(route.path === menu.value ? 'text-accent-500' : 'text-gray-500')
  cls.push(menu.position === 'right' ? 'absolute right-5' : 'relative')
  return cls.join(' ')
}

const onClick = (value: string) => {
  router.push(value)
}
</script>
