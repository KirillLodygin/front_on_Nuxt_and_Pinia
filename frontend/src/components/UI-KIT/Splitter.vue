<!-- Компонент выводит горизонтальный разделитель для элементов внутри flex контейнера -->
<!-- Верхний элемент должен иметь в стиле height: x%; -->
<!-- Нижний элемент должен иметь в стиле flex: 1; -->
<template>
  <div ref="$splitter" class="splitter-h" style="flex: 0 0 11px">
    <div ref="$splitterBtn" class="splitter-grap-h">
      <div class="splitter-grap-line"></div>
      <div class="splitter-grap-line"></div>
    </div>
  </div>
</template>

<script name="Splitter" setup>
const props = defineProps({
  // Минимальный размер первого элемента в %
  max: { type: Number, default: 100 },
  // Максимальный размер первого элемента в %
  min: { type: Number, default: 0 },
})
// Размер первого элемента в %
const model = defineModel({ type: Number, default: 50 })

const $splitter = ref(null)
const $splitterBtn = ref(null)
let prevSide = null
let nextSide = null
let x = 0
let y = 0
let prevSize = 0

onMounted(() => {
  if ($splitter.value && $splitterBtn.value) {
    $splitterBtn.value.addEventListener('mousedown', onMouseDown)
    prevSide = $splitter.value.previousElementSibling
    nextSide = $splitter.value.nextElementSibling

    prevSide.style.height = model.value + '%'
  }
})

onUnmounted(() => {})

const onMouseDown = (event) => {
  x = event.clientX
  y = event.clientY
  if (prevSide) {
    prevSize = prevSide.getBoundingClientRect().height

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    if (event.stopPropagation) event.stopPropagation()
    if (event.preventDefault) event.preventDefault()
    event.cancelBubble = true
    event.returnValue = false
    return false
  }
}

const onMouseMove = (event) => {
  const dx = event.clientX - x
  const dy = event.clientY - y

  let newPrevSize = ((prevSize + dy) * 100) / $splitter.value.parentNode.getBoundingClientRect().height
  newPrevSize = Math.max(props.min, newPrevSize)
  newPrevSize = Math.min(props.max, newPrevSize)

  prevSide.style.height = newPrevSize + '%'
  nextSide.style.removeProperty('min-height')
  // nextSide.style.height = (100 - newPrevSize) + '%';

  model.value = newPrevSize

  $splitter.value.style.cursor = 'row-resize'
  document.body.style.cursor = 'row-resize'

  prevSide.style.userSelect = 'none'
  prevSide.style.pointerEvents = 'none'

  nextSide.style.userSelect = 'none'
  nextSide.style.pointerEvents = 'none'
}

const onMouseUp = () => {
  $splitter.value.style.removeProperty('cursor')
  document.body.style.removeProperty('cursor')

  prevSide.style.removeProperty('user-select')
  prevSide.style.removeProperty('pointer-events')

  nextSide.style.removeProperty('user-select')
  nextSide.style.removeProperty('pointer-events')

  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}
</script>
