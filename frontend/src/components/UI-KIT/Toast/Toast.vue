<template>
  <div v-if="Object.keys(toasts).length" class="toast-container end-0 bottom-0 p-4">
    <div
      v-for="[index, toast] in Object.entries(toasts)"
      :class="[
        'toast d-block',
        { 'bg-danger': toast.type === 'error' },
        { 'bg-light': toast.type === 'message' },
        { 'bg-success': toast.type === 'success' },
      ]"
    >
      <div class="toast-header">
        <i
          :class="[
            'me-3 icon',
            { 'fi_alert-triangle': toast.type === 'error' },
            { fi_info: toast.type === 'message' },
            { 'fi_plus-circle': toast.type === 'success' },
          ]"
        />
        <strong class="me-auto">{{ headerText(toast.type) }}</strong>
        <button
          aria-label="Закрыть"
          class="btn-close"
          data-bs-dismiss="toast"
          type="button"
          @click="closeToast(Number(index))"
        ></button>
      </div>
      <div class="toast-body">{{ toast.value }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { $userStore } = useNuxtApp()
const toasts = computed(() => $userStore.toasts)
const headerText = (type: string) => {
  let text = ''
  if (type === 'error') text = 'Внимание'
  else text = 'Информация'
  return text
}
const closeToast = (index: number) => {
  delete $userStore.toasts[index]
}
</script>
