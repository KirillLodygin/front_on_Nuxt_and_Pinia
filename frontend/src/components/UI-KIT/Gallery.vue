<template>
  <BModal
    v-model="toggle"
    :class="{ 'd-block': toggle }"
    body-class="overflow-y-auto"
    centered
    content-class="map-modal-content"
    dialog-class="map-modal-dialog"
    ok-only
    ok-title="Закрыть"
    size="xl"
    title="ИЗОБРАЖЕНИЕ"
    @hide="resetSelectedImage"
    @ok="toggle = false"
  >
    <BCarousel
      v-if="imgSrcList.length && (index || index === 0)"
      v-model="computedIndex"
      :interval="0"
      class="h-100"
      controls
      indicators
    >
      <BCarouselSlide v-for="(image, i) in imgSrcList" :key="'#gallery_image_' + i" class="h-100 overflow-y-auto">
        <template #img>
          <div v-if="computedImageName(i)" class="gallery-image-name">
            <span class="gallery-image-name-text">{{ computedImageName(i) }}</span>
          </div>
          <div class="fullscreener">
            <div @click="() => openFullScreen(i)">
              <i class="icon fi_maximize-2 icon-3xl" />
            </div>
          </div>
          <img :alt="image.title" :src="image.url" class="d-block img-fluid mx-auto h-100" />
        </template>
      </BCarouselSlide>
    </BCarousel>
    <div v-if="isFullScreen && Object.keys(fileForFullScreen).length" class="full-screened-image bg-light">
      <div class="fullscreener">
        <div @click="() => closeFullScreen()">
          <i class="icon fi_x icon-3xl" />
        </div>
      </div>
      <img :alt="fileForFullScreen.title" :src="fileForFullScreen.url" class="d-block img-fluid mx-auto w-100" />
    </div>
    <template #footer="{ ok, cancel }">
      <slot name="footer" v-bind="{ ok, cancel }"></slot>
    </template>
  </BModal>
</template>

<script lang="ts" setup>
interface Props {
  modelValue: boolean
  index: number
  imgSrcList: Array<{
    url: string
    title: string
  }>
}

const props = defineProps<Props>()

const emit = defineEmits(['update:modelValue', 'onClose'])
const toggle = computed({
  get: () => {
    if (props.modelValue) {
      computedIndex.value = props.index
    }
    return props.modelValue
  },
  set: (value: boolean) => {
    if (!value) {
      computedIndex.value = 0
    }
    emit('update:modelValue', value)
  },
})
const resetSelectedImage = () => {
  emit('onClose', null)
}
const computedIndex = ref(props.index)
const computedImageName = (i: number) => props.imgSrcList[i].title
const isFullScreen = ref(false)
const fileForFullScreen = ref<Record<string, any>>({})
const openFullScreen = (i: number) => {
  fileForFullScreen.value = props.imgSrcList[i]
  isFullScreen.value = true
}
const closeFullScreen = () => {
  fileForFullScreen.value = {}
  isFullScreen.value = false
}
</script>
