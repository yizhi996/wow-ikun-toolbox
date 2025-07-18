<template>
  <ElButton v-bind="props" @mousedown.prevent=""><slot></slot></ElButton>
</template>

<script setup lang="ts">
import { ButtonProps } from 'element-plus'

const props = defineProps<Partial<ButtonProps>>()
</script>

<style scoped></style>
