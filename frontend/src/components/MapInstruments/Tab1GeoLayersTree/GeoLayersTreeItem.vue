<template>
  <li
    class="mb-2 w-100"
    style="list-style-type: none"
    :draggable="$mapStore.isOpenLayersSettings"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragleave="handleDragLeave"
  >
    <div v-if="isOverDropTarget" class="drop-indicator" @drop="handleDrop" @dragover.prevent></div>
    <div ref="treeItemContainer" class="w-100 d-flex align-items-center">
      <i
        v-if="$mapStore.isOpenLayersSettings"
        ref="treeItemDragElem"
        class="icon icon-lg ksi_drag-panel cursor-pointer me-2"
        @dragenter="handleDragEnter"
      />
      <div
        class="d-inline-flex align-items-center"
        :style="{ width: `${computedTreeItemWidthWithoutDragElem}px` }"
        @dragenter="startExpandTimer"
        @dragleave="clearExpandTimer"
      >
        <div class="align-items-center d-flex" :style="{ width: `${computedTreeItemWidthWithoutDragElem}px` }">
          <i
            :class="[
              'icon icon-lg',
              { 'fi_chevron-down': hasChildren && isExpanded },
              { 'fi_chevron-right': hasChildren && !isExpanded },
              { ksi_bullet_square: !hasChildren },
              { 'cursor-pointer': hasChildren },
            ]"
            @click="toggleExpanded"
          ></i>

          <span
            v-if="node.status === 'loading'"
            class="circle-precentage-progress-bar"
            :style="{
              '--degrees': `${(node.percentLoaded || 0) * 3.6}deg`,
              '--color': node.data.color || 'var(--deep-gray)',
            }"
          ></span>
          <span v-else :class="computedIconClass" :style="computedIconStyle"></span>
          <span ref="ellipsisText" class="text-ellipsis" :title="isEllipsis && node.data.name ? node.data.name : ''">{{
            node.data.name
          }}</span>
          <span v-if="node.data.layer_type === 'A'" ref="counter" class="badge layer-type">ad</span>
          <span v-if="node.objCount" ref="counter" class="badge layer-counter">{{ node.objCount }}</span>
          <span class="ms-auto me-2 layer-settings-menu">
            <template v-if="$mapStore.isOpenLayersSettings">
              <i
                v-if="!layersMenuShow"
                class="icon fi_more-vertical cursor-pointer me-2"
                @click="
                  () => {
                    $mapStore.setGeoLayerNode({ id: node.id, ...node.data })
                    layersMenuShow = true
                  }
                "
              />
              <GeoLayerMenu v-else v-model="layersMenuShow" v-if="$mapStore.isOpenLayersSettings" />
            </template>
            <i v-else :class="[eyeClass, 'cursor-pointer me-2']" @click="() => viewGeoLayer(node.id)" />
          </span>
        </div>
      </div>
    </div>
  </li>
  <ul v-if="hasChildren && isExpanded" class="w-100">
    <GeoLayersTreeItem v-for="item in node.children" :key="item.data.id" :node="item" />
  </ul>
</template>

<script lang="ts" setup>
import type { geoLayerTreeNodeType } from '~/types/treeTypes'
import { computed, ref } from 'vue'
import GeoLayerMenu from '~/components/MapInstruments/Tab1GeoLayersTree/GeoLayerMenu.vue'

interface Props {
  node: geoLayerTreeNodeType
}

const props = defineProps<Props>()
const { $mapStore } = useNuxtApp()

const isExpanded = ref(false)
const eyeClass = ref('icon fi_eye-off')
const layersMenuShow = ref(false)
const ellipsisText = ref<HTMLSpanElement | null>(null)
const treeItemContainer = ref<HTMLDivElement | null>(null)
const treeItemDragElem = ref<HTMLElement | null>(null)
const isEllipsis = ref(false)
let observer: ResizeObserver | null = null

const computedTreeItemWidthWithoutDragElem = computed(() => {
  const container = treeItemContainer.value as HTMLDivElement
  const dragElem = treeItemDragElem.value as HTMLElement
  if (container) {
    if (dragElem) {
      return container.clientWidth - dragElem.clientWidth
    } else {
      return container.clientWidth
    }
  }
  return 0
})
const checkEllipsis = () => {
  const element = ellipsisText.value as HTMLSpanElement
  if (element) {
    isEllipsis.value = element.scrollWidth > element.clientWidth
  }
}
onMounted(() => {
  if (props.node && $mapStore.visibleLayersId.includes(props.node.id)) {
    eyeClass.value = 'icon fi_eye'
  }
  if (props.node && 'isExpanded' in props.node) {
    isExpanded.value = props.node.isExpanded ?? false
  }

  const element = ellipsisText.value as HTMLSpanElement
  if (element) {
    observer = new ResizeObserver(() => {
      checkEllipsis()
    })
    observer.observe(element)
    checkEllipsis()
  }
})
onBeforeUnmount(() => {
  if (observer && ellipsisText.value) {
    observer.unobserve(ellipsisText.value)
  }
})
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

const toggleExpanded = () => {
  const value = !isExpanded.value
  isExpanded.value = value
  props.node.isExpanded = value
}

// TODO иконки созданы в виде круга, треугольника и квадрата, нужна будет переделка, если будут придуманы новые фигуры
const computedIconClass = computed(() => {
  if (props.node.data?.glyph_name) {
    return `color-${props.node.data.glyph_name}`
  }
  return 'color-circle'
})
// TODO стили описаны на основе придуманных выше фигур. Нужна переделка, если выше переделается.
const computedIconStyle = computed(() => {
  if (props.node.data?.color) {
    if ((props.node.data?.glyph_name as string) === 'triangle') {
      return { 'border-bottom-color': String(props.node.data.color) }
    }
    return { backgroundColor: String(props.node.data.color) }
  }
  return { backgroundColor: '#AAAAAA' }
})

const viewGeoLayer = (id: number | undefined) => {
  if (eyeClass.value === 'icon fi_eye') {
    if (id) {
      eyeClass.value = 'icon fi_eye-off'
      $mapStore.hideGeoLayer(id)
    }
  } else {
    if (id) {
      eyeClass.value = 'icon fi_eye'
      $mapStore.showGeoLayer(id)
    }
  }
}

watch(
  () => $mapStore.isLayersViewReset,
  () => {
    if ($mapStore.isLayersViewReset) {
      eyeClass.value = 'icon fi_eye-off'
    }
  },
)

const isOverDropTarget = ref(false)
const expandTimer = ref<number | null>(null)
const expandDelay = 1000

const handleDragStart = (event: DragEvent) => {
  event.stopPropagation()
  const draggedId = props.node.id
  if (draggedId) {
    $mapStore.setDraggedId(draggedId)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  const droppedId = props.node.id
  if (droppedId && $mapStore.draggedId !== droppedId) {
    $mapStore.setDroppedId(droppedId)
    $mapStore.moveGeoLayer()
  }
  isOverDropTarget.value = false
}

const handleDragEnter = (event: DragEvent) => {
  const currentTarget = event.currentTarget as HTMLElement
  const relatedTarget = event.relatedTarget as HTMLElement

  if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
    const overedId = props.node.id
    if (!isOverDropTarget.value && overedId && $mapStore.draggedId !== overedId) {
      isOverDropTarget.value = true
    }
  }
}

const handleDragLeave = (event: DragEvent) => {
  const currentTarget = event.currentTarget as HTMLElement
  const relatedTarget = event.relatedTarget as HTMLElement

  if (relatedTarget && !currentTarget.contains(relatedTarget)) {
    if (isOverDropTarget.value) {
      isOverDropTarget.value = false
    }
  }
}

let dragCounter = 0

const startExpandTimer = () => {
  dragCounter++
  if (dragCounter === 1) {
    if (!isExpanded.value) {
      expandTimer.value = window.setTimeout(() => {
        isExpanded.value = true
      }, expandDelay)
    }
  }
}

const clearExpandTimer = () => {
  dragCounter--
  if (dragCounter === 0) {
    if (expandTimer.value) {
      clearTimeout(expandTimer.value)
      expandTimer.value = null
    }
  }
}

const handleDragEnd = () => {
  isOverDropTarget.value = false
  $mapStore.setDraggedId(null)
  $mapStore.setDroppedId(null)
  if (expandTimer.value !== null) {
    clearTimeout(expandTimer.value)
    expandTimer.value = null
  }
}
</script>
