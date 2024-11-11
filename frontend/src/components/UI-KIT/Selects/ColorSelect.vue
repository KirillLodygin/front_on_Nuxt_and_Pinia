<template>
  <div class="form-control form-control-lg custom-color-picker" v-click-outside="closeOpacitySlider">
    <div class="color-box" :style="{ backgroundColor: rgbaColor }" @click="openColorPicker"></div>
    <span class="color-code" @click="openColorPicker">{{ hexColor.toUpperCase() }}</span>
    <span class="opacity" @click.stop="toggleOpacitySlider">{{ opacity }}%</span>
    <input type="color" ref="colorPicker" v-model="color" class="color-picker" @input="updateRgba" />
    <div v-if="showOpacitySlider" class="opacity-slider">
      <input type="range" v-model="opacity" min="0" max="100" @input="updateRgba" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: String,
})
const emit = defineEmits(['update:modelValue'])

const color = ref(props.modelValue || '#ff9900')
const opacity = ref(100)
const showOpacitySlider = ref(false)
const colorPicker = ref<HTMLInputElement | null>(null)

// Вычисляемый цвет в RGBA формате
const rgbaColor = computed(() => {
  const hex = color.value.substring(1)
  const bigint = parseInt(hex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${opacity.value / 100})`
})

// Преобразование RGBA в HEX с учетом прозрачности
const hexColor = computed(() => {
  const alpha = Math.round((opacity.value / 100) * 255)
    .toString(16)
    .padStart(2, '0')
  return color.value + alpha
})

// Открытие выбора цвета
const openColorPicker = () => {
  colorPicker.value?.click()
}

// Обновление RGBA и передача результата в родителя
const updateRgba = () => {
  const updatedHex = hexColor.value
  emit('update:modelValue', updatedHex)
}

// Переключение видимости ползунка прозрачности
const toggleOpacitySlider = (event: Event) => {
  showOpacitySlider.value = !showOpacitySlider.value
  event.stopPropagation()
}

const closeOpacitySlider = () => {
  showOpacitySlider.value = false
}

// Автоматическая синхронизация с моделью, если значение изменяется извне
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      color.value = newValue.substring(0, 7) // Цвет без альфа-значения
      const alphaHex = newValue.substring(7, 9) || 'ff'
      opacity.value = Math.round((parseInt(alphaHex, 16) / 255) * 100) // Прозрачность
    }
  },
  { immediate: true },
)
</script>
