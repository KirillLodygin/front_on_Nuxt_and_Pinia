<template>
  <input
    :id="props.id"
    v-model="value"
    :disabled="disabled"
    class="form-control form-control-lg lh-1"
    style="font-size: 14px"
    type="text"
  />
</template>

<script lang="ts" setup>
const props = defineProps({
  defaultValue: { type: [Number, String], required: false },
  field: { type: String, required: false },
  label: { type: String, required: false },
  index: { type: Number, required: false },
  disabled: { type: Boolean, required: false, default: false },
  id: { type: String, required: false },
})
const { $calculations }: any = useNuxtApp()
const emit = defineEmits(['input'])

const value = ref<string | number | undefined>('')

onMounted(() => {
  value.value = props.defaultValue
})

watch(
  () => value.value,
  () => {
    emit('input', props.field, props.label, props.index, value.value)
  },
)
</script>
