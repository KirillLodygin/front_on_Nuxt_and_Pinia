<!-- Компонент выводит панель с надписью о загрузке и блокирует доступ к аомпонентам под ней -->
<template>
  <div class="table-load-bg" ref="$node">
    <div class="table-load">
      <div class="spinner-border" role="status"></div>
      <div>Загрузка данных...</div>
      <div v-if="isExpress" class="mt-3">
        <div>{{ iterationCounter }} цикл расчетов</div>
        <div class="text-left">Подобрано аналогов: {{ currentAnalogsLength }}</div>
        <div class="text-left">Отбраковано: {{ allDeletedAnalogsLength }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from 'nuxt/app'
import { computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // Идентификатор целевого объекта, который закрывается данным компонентом
  // Если не задан, то будет использоваться родитель
  target: { type: String, required: false },
})

const $node = ref(null)
let targetEl = null
let heightObserver = null
const { $calculations } = useNuxtApp()

const isExpress = computed(() => $calculations.isExpress)
const iterationCounter = computed(() => $calculations.iterationCounter)
const currentAnalogsLength = computed(() => $calculations.currentAnalogs.length)
const allDeletedAnalogsLength = computed(() => {
  if ($calculations.currentAnalogs.length < $calculations.allDeletedAnalogs.length) {
    return $calculations.currentAnalogs.length
  }

  return $calculations.allDeletedAnalogs.length
})

onMounted(() => {
  if (props.target) {
    targetEl = document.querySelector('#' + props.target)
  }
  if (!targetEl && $node.value) {
    targetEl = $node.value.parentElement
  }

  updateSize()

  heightObserver = targetEl ? new ResizeObserver(updateSize).observe(targetEl) : null
})

onUnmounted(() => {
  if (heightObserver) {
    heightObserver.disconnect()
  }
})

const updateSize = () => {
  if ($node.value && targetEl) {
    const rect = targetEl.getBoundingClientRect()
    $node.value.style.width = rect.width + 'px'
    $node.value.style.height = rect.height + 'px'
  }
}
</script>
