import { ElMessage, ElMessageBox, ElMessageBoxOptions } from 'element-plus'

export const showErrorMessage = (message: string) => {
  ElMessage({
    message,
    type: 'error'
  })
}

export const showSuccessMessage = (message: string) => {
  ElMessage({
    message,
    type: 'success'
  })
}

export const showWarningMessage = (message: string) => {
  ElMessage({
    message,
    type: 'warning'
  })
}
