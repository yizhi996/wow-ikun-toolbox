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
      style="height: calc(100% - 148px)"
      :data="
        searchCharacterName
          ? characters.filter(character => character.name.includes(searchCharacterName))
          : characters
      "
      highlight-current-row
      @current-change="onSelectChange"
    >
      <ElTableColumn property="name" label="角色" width="140" >
        <template #default="scope">
          <span :style="{color: scope.row.classColor}">{{ scope.row.name }}</span>
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
import { onMounted, ref } from 'vue'
import { Flavor, loadWTFCharacters, WTF } from '~/core/wtf'
import { SelectOption } from '~/utils'

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

const characters = ref<WTF[]>([])

const searchCharacterName = ref('')

onMounted(async () => {
  if (props.flavor) {
    const res = await loadWTFCharacters(props.flavor)
    characters.value = res
  }
})

const onSelectChange = (val: WTF | undefined) => {
  emit('update:select', val)
}

const onFlavorChange = async (val: string) => {
  emit('update:flavor', val)
  const res = await loadWTFCharacters(val)
  characters.value = res
}
</script>
