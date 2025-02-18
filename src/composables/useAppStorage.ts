import { Ref, ref, toRaw, watch } from 'vue'
import { getStorage, setStorage } from '~/utils/storage'

export function useAppStorage<T>(key: string, initialValue: T) {
  const data = ref(initialValue)

  const isActive = ref(false)

  watch(
    data,
    newValue => {
      if (isActive.value) {
        setStorage(key, toRaw(newValue))
      }
    },
    { deep: true }
  )
  ;(async function () {
    isActive.value = false
    const value = await getStorage(key)
    if (value !== undefined) {
      // @ts-ignore
      data.value = value
    }
    setTimeout(() => {
      isActive.value = true
    })
  })()

  return data as Ref<T>
}
