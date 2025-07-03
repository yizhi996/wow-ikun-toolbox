<template>
  <div class="p-5 flex flex-col h-full">
    <div class="w-full">
      <div class="w-full h-full flex flex-col">
        <div class="flex items-center">
          <AppButton
            size="large"
            type="primary"
            :icon="Plus"
            @click="
              () => {
                myslotText = ''
                myslotDialogVisible = true
              }
            "
            >新增</AppButton
          >
          <!-- <MyslotImport></MyslotImport> -->
          <AppButton
            class="ml-5"
            size="large"
            type="success"
            :icon="RefreshRight"
            @click="onReadMyslots"
            >刷新</AppButton
          >
        </div>
        <ElInput
          v-model="search"
          class="mt-5"
          style="width: 256px"
          placeholder="搜索角色名"
          :suffix-icon="Search"
        ></ElInput>
      </div>
    </div>

    <div class="flex mt-5">
      <div>
        <ElTable
          :border="true"
          style="height: 535px"
          :data="filterMyslots"
          highlight-current-row
          @current-change="onSelectMyslot"
          @selection-change="onSelectionChange"
        >
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn property="name" label="角色" width="140">
            <template #default="scope">
              <span class="flex items-center">
                <span :style="{ color: scope.row.classColor }">{{ scope.row.name }}</span>
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn property="talent" label="天赋" width="80" />
          <ElTableColumn property="date" label="日期" width="200" />
        </ElTable>
        <AppButton
          class="mt-5"
          type="danger"
          :disabled="multipleSelection.length === 0"
          @click="onDelete"
          >删除</AppButton
        >
      </div>

      <div class="w-full ml-5" v-if="selectedMyslot">
        <ElInput
          v-model="selectedMyslot.content"
          type="textarea"
          resize="none"
          :autosize="{ minRows: 25, maxRows: 25 }"
          disabled
        ></ElInput>

        <div class="flex justify-end mt-5">
          <AppButton type="success" :disabled="!selectedMyslot" @click="onCopy">复制</AppButton>
          <AppButton type="primary" :disabled="!selectedMyslot" @click="onShowInFolder"
            >在文件夹中显示</AppButton
          >
        </div>
      </div>
    </div>
  </div>

  <ElDialog v-model="myslotDialogVisible" title="Myslot" width="500" align-center>
    <AppButton type="success" @click="onReadClipboard">粘贴</AppButton>
    <ElInput
      v-model="myslotText"
      class="mt-5"
      type="textarea"
      :autosize="{ minRows: 10, maxRows: 10 }"
      resize="none"
    />

    <template #footer>
      <div>
        <AppButton @click="myslotDialogVisible = false">取消</AppButton>
        <AppButton type="primary" @click="onSave">保存</AppButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { useStore } from '~/store'
import { ipcRenderer } from 'electron'
import { showErrorMessage, showSuccessMessage } from '~/utils/message'
import { ElDialog, ElInput, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import AppButton from '~/components/AppButton.vue'
import { Download, Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { join, extname } from 'node:path'
import { writeFile, mkdir, readFile, stat, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { IPCChannel } from '~shared'
import { classNameToIndex, classColorFromIndex } from '~/core/wtf/classes'
import { flavorToSelector, loadFlavors, WTF } from '~/core/wtf'
import WTFForm from '~/components/WTF/Overwrite/WTFForm.vue'
import { fs_readdir } from '~/utils/fs'
import { loadWTFMyslots, parseMyslotText } from '~/core/myslot'

interface Myslot {
  name: string
  classes: string
  classColor?: string
  talent: string
  date: string
  filename: string
  content?: string
}

const store = useStore()

const MYSLOT_DIR = join(store.appInfo.paths.userData, 'myslot')

const myslotDialogVisible = ref(false)
const myslotText = ref('')

const search = ref('')

const myslots = ref<Myslot[]>([])

const filterMyslots = computed(() => {
  let res = myslots.value

  if (search.value) {
    const lowerCaseName = search.value.toLowerCase()
    res = res.filter(myslot => myslot.name.toLowerCase().includes(lowerCaseName))
  }
  return res
})

onMounted(() => {
  onReadMyslots()
})

const selectedMyslot = ref<Myslot>()

const onSelectMyslot = async (myslot: Myslot | undefined) => {
  if (myslot) {
    const path = join(MYSLOT_DIR, myslot.filename)
    if (!existsSync(path)) {
      showErrorMessage('Myslot 不存在')
      selectedMyslot.value = undefined
      return
    }
    const content = await readFile(path, 'utf-8')
    myslot.content = content
    selectedMyslot.value = myslot
  } else {
    selectedMyslot.value = undefined
  }
}

const onCopy = async () => {
  if (!selectedMyslot.value || !selectedMyslot.value.content) {
    return
  }
  await navigator.clipboard.writeText(selectedMyslot.value.content)
  showSuccessMessage('复制成功')
}

const onShowInFolder = async () => {
  if (!selectedMyslot.value) {
    return
  }
  const path = join(MYSLOT_DIR, selectedMyslot.value.filename)
  if (!existsSync(path)) {
    showErrorMessage('Myslot 不存在')
    return
  }

  ipcRenderer.invoke(IPCChannel.SHOW_IN_FOLDER, path)
}

const onReadClipboard = async () => {
  myslotText.value = ''
  myslotText.value = await navigator.clipboard.readText()
}

const onSave = async () => {
  try {
    const myslot = parseMyslotText(myslotText.value)

    try {
      const baseFilename = `${myslot.name}_${myslot.classes}_${myslot.talent}_${myslot.createAt}`
      let filename = baseFilename
      let counter = 0
      while (existsSync(join(MYSLOT_DIR, `${filename}.txt`))) {
        filename = `${baseFilename}_${counter++}`
      }

      await writeFile(join(MYSLOT_DIR, `${filename}.txt`), myslotText.value)

      myslotDialogVisible.value = false
      showSuccessMessage('保存成功')

      onReadMyslots()
    } catch {
      showErrorMessage('保存失败')
    }
  } catch (e) {
    showErrorMessage((e as Error).message)
  }

  if (!existsSync(MYSLOT_DIR)) {
    await mkdir(MYSLOT_DIR)
  }
}

const onReadMyslots = async () => {
  if (!existsSync(MYSLOT_DIR)) {
    await mkdir(MYSLOT_DIR)
  }
  const files = (await fs_readdir(MYSLOT_DIR)).filter(file => extname(file) === '.txt')
  const res: (Myslot & { birthtime: number })[] = []
  for (const file of files) {
    const info = file.split('_')
    if (info.length < 4) {
      continue
    }
    res.push({
      name: info[0],
      classes: info[1],
      classColor: classColorFromIndex(classNameToIndex(info[1])),
      talent: info[2],
      date: dayjs(parseInt(info[3].substring(0, 10)) * 1000).format('YYYY-MM-DD HH:mm:ss'),
      filename: file,
      birthtime: (await stat(join(MYSLOT_DIR, file))).birthtimeMs
    })
  }
  res.sort((a, b) => b.birthtime - a.birthtime)
  myslots.value = res
}

const multipleSelection = ref<Myslot[]>([])

const onSelectionChange = (val: Myslot[]) => {
  multipleSelection.value = val
}

const onDelete = async () => {
  ElMessageBox.confirm(`确定删除 ${multipleSelection.value.length} 个 Myslot 吗?`, '操作确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      for await (const myslot of multipleSelection.value) {
        const path = join(MYSLOT_DIR, myslot.filename)
        if (existsSync(path)) {
          await rm(path)
        }
      }
      showSuccessMessage('删除成功')
      onReadMyslots()
    })
    .catch(() => {})
}
</script>
