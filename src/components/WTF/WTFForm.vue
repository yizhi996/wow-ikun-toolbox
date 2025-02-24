<template>
  <div class="flex flex-col space-y-3">
    <span class="flex items-center"
      ><span class="text-lg">{{ title }}</span>
      <span v-if="select" class="font-semibold">{{ select.name }} - {{ select.realm }}</span>
    </span>

    <div class="flex space-x-2">
      <ElSelect :model-value="flavor" @change="onFlavorChange">
        <ElOption v-for="item in flavors" :key="item.value" :label="item.label" :value="item.value">
          <div class="flex items-center justify-between">
            <span>{{ item.label }}</span>
            <span class="text-gray-400 text-xs">
              {{ item.value }}
            </span>
          </div>
        </ElOption>
      </ElSelect>

      <ElInput v-model="searchCharacterName" placeholder="搜索角色名" :prefix-icon="Search" />
    </div>

    <ElTable
      border
      style="height: calc(100% - 168px)"
      :data="filterCharacters"
      highlight-current-row
      @current-change="onSelectChange"
    >
      <ElTableColumn property="name" label="角色" width="140">
        <template #default="scope">
          <span :style="{ color: scope.row.classColor }">{{ scope.row.name }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn property="realm" label="服务器" width="120" />
      <ElTableColumn property="account" label="子账号" width="150" />
    </ElTable>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { ElInput, ElOption, ElSelect, ElTable, ElTableColumn } from 'element-plus'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Flavor, loadWTFCharacters, WTF } from '~/core/wtf'
import { SelectOption } from '~/utils'
import { useStore } from '~/store'
import { useEventBus } from '@vueuse/core'

const props = defineProps<{
  title: string
  select: WTF | undefined
  flavor: Flavor | string
  flavors: SelectOption[]
}>()

const emit = defineEmits<{
  'update:flavor': [value: Flavor | string]
  'update:select': [value: WTF | undefined]
}>()

const store = useStore()

const bus = useEventBus<string>('WOW_DIR_CHANGED')

const characters = ref<WTF[]>([])

const searchCharacterName = ref('')

const filterCharacters = computed(() => {
  let res = characters.value
  if (store.onlyShowLoggedCharacters) {
    res = characters.value.filter(character => character.logged)
  }
  if (searchCharacterName.value) {
    const lowerCaseName = searchCharacterName.value.toLowerCase()
    res = res.filter(character => character.name.toLowerCase().includes(lowerCaseName))
  }
  return res
})

onMounted(async () => {
  loadCharacters()
  bus.on(loadCharacters)
})

onUnmounted(() => {
  bus.off(loadCharacters)
})

const onSelectChange = (val: WTF | undefined) => {
  emit('update:select', val)
}

const onFlavorChange = async (val: string) => {
  emit('update:flavor', val)
  const res = await loadWTFCharacters(val)
  characters.value = res
}

const loadCharacters = async () => {
  if (props.flavor) {
    const res = await loadWTFCharacters(props.flavor)
    characters.value = res
  } else {
    characters.value = []
  }
}
</script>
