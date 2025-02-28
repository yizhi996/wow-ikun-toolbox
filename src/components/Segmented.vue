<template>
  <div class="flex items-center space-x-3 select-none">
    <template v-for="(item, i) of options" :key="item.value">
      <span
        class="cursor-pointer text-sm font-semibold"
        :class="{ 'text-accent-500': modelValue === item.value }"
        @click="emit('update:modelValue', item.value)"
        >{{ item.label }}
      </span>
      <span v-if="i !== options.length - 1">|</span>
    </template>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const props = defineProps<{ modelValue: string; options: { value: string; label: string }[] }>()
</script>
