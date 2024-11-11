<template>
  <label
    :for="`file-upload-${inputId}`"
    :style="{ border: `${borderWidth} solid ${borderColor}`, height: height, borderRadius: borderRadius }"
    class="input-group-text bg-white justify-content-end align-middle p-0"
  >
    <span class="p-2 me-auto">{{ labelText }}</span>
    <span class="h-100 border-start p-0 m-0" :style="{ width: dividerWidth }">&nbsp;</span>
    <span class="p-2">{{ chooseButtonText }}</span>
    <slot name="extra-content"></slot>
  </label>
  <input
    ref="fileUploader"
    :id="`file-upload-${inputId}`"
    :multiple="multiple"
    class="d-none"
    type="file"
    @change="fileUpload"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  multiple: Boolean,
  borderColor: { type: String, default: 'var(--edit-border-color)' },
  borderWidth: { type: String, default: 'var(--edit-border-width)' },
  height: { type: String, default: '100%' },
  borderRadius: { type: String, default: '' },
  fileLabelText: { type: String, default: 'Файл' },
  fileLabelTextReset: { type: Boolean, required: false },
  chooseButtonText: { type: String, default: 'Выбрать' },
  dividerWidth: { type: String, default: '2px' },
  inputId: { type: String, default: 'default' },
})
const emit = defineEmits(['getFiles', 'update:fileLabelTextReset'])
const files = ref<FileList | null>(null)
const fileUploader = ref<HTMLInputElement | null>(null)
watch(
  () => props.fileLabelTextReset,
  () => {
    if (props.fileLabelTextReset) {
      files.value = null
      if (fileUploader.value) {
        fileUploader.value.value = ''
      }
      emit('update:fileLabelTextReset', false)
    }
  },
)
const fileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement

  if (target && target.files) {
    const filesArr = target.files
    files.value = target.files

    emit('getFiles', filesArr)
  }
}

const labelText = computed(() => {
  const fileList = files.value
  if (fileList && fileList.length === 1) {
    const labelArr = fileList[0].name.split('.')
    let firstLabelArrItem = labelArr.slice(0, labelArr.length - 1).join('.')
    const lastLabelArrItem = [labelArr[labelArr.length - 1]]
    if (firstLabelArrItem.length > 20) {
      firstLabelArrItem = `${labelArr[0].substring(0, 21)}...`
    }
    return [firstLabelArrItem].concat(lastLabelArrItem).join('.')
  }
  if (fileList && fileList.length > 1) {
    return `Выбраны: ${fileList.length} файла(ов)`
  }
  return props.fileLabelText
})
</script>
