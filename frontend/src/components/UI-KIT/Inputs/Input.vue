<template>
  <div :class="{ 'input-group-solid': solidClass(), 'position-relative': true }">
    <div v-if="props.iconClass" class="input-icon">
      <i :class="['icon', props.iconClass]"></i>
    </div>
    <input
      :id="props.id"
      :value="props.modelValue"
      @input="onInput($event)"
      :type="inputType"
      :placeholder="props.placeholder"
      :class="['form-control', { 'form-control-lg': props.isLarge }]"
      @blur="onBlur"
      @focus="onFocus"
    />
    <template v-if="props.type === 'search'">
      <div v-if="props.modelValue" class="input-group-button" role="button" @click="onClearClick">
        <i class="icon icon-lg fi_backspace"></i>
      </div>
      <div v-else class="input-group-button">
        <i class="icon icon-lg fi_search icon-medium"></i>
      </div>
    </template>
    <template v-else-if="props.type === 'password'">
      <div class="input-group-button" @click="togglePwdVisible" role="button">
        <i :class="'icon icon-lg ' + (showPwd ? 'fi_eye-off' : 'fi_eye')"></i>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  modelValue: { type: String, required: true },
  type: { type: String, required: false, default: 'text' },
  id: { type: String, required: false },
  placeholder: { type: String, required: false, default: '' },
  isLarge: { type: Boolean, required: false, default: true },
  onBlurClear: { type: Boolean, required: false, default: false },
  iconClass: { type: String, required: false },
})

const showPwd = ref(false)
const emit = defineEmits(['update:modelValue', 'onFocus', 'onBlur'])

const inputType = computed(() => (props.type === 'password' ? (showPwd.value ? 'text' : 'password') : props.type))

const onInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  emit('update:modelValue', input.value)
}

const onFocus = () => emit('onFocus')
const onBlur = () => {
  if (props.onBlurClear) {
    emit('update:modelValue', '')
  }
  emit('onBlur')
}

const onClearClick = () => emit('update:modelValue', '')
const togglePwdVisible = () => (showPwd.value = !showPwd.value)

const solidClass = () => props.type === 'search' || props.type === 'password'
</script>
