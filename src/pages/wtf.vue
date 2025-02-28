<template>
  <div class="flex h-full">
    <div v-if="store.wowRootDir" class="w-full flex flex-col items-center">
      <div
        class="w-full px-5 py-2 flex items-center space-x-10 border-b-[1px] border-white border-opacity-20"
      >
        <Segmented class="h-10" v-model="currentSegment" :options="segments"></Segmented>
      </div>
      <Overwrite v-show="currentSegment === 'overwrite'" class="h-[calc(100%-57px)]"></Overwrite>
      <Synchronize v-show="currentSegment === 'synchronize'"></Synchronize>
    </div>
    <div v-else class="w-full flex items-center justify-center h-full">
      <RouterLink to="/settings">
        <AppButton type="primary">设置魔兽世界路径</AppButton>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from '~/store'
import AppButton from '~/components/AppButton.vue'
import { RouterLink } from 'vue-router'
import Segmented from '~/components/Segmented.vue'
import Overwrite from '~/components/WTF/Overwrite/Overwrite.vue'
import Synchronize from '~/components/WTF/Synchronize/Synchronize.vue'

const store = useStore()

const currentSegment = ref('overwrite')
const segments = [
  {
    label: '配置覆盖',
    value: 'overwrite'
  },
  {
    label: '同步设置',
    value: 'synchronize'
  }
]
</script>
