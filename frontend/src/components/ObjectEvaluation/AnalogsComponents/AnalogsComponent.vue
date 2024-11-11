<template>
  <div class="h-100">
    <div ref="analogsComponentFunctionalButtonsRef" class="d-flex justify-content-between">
      <FunctionalButtons :data="functionalButtonsData" />
    </div>
    <LoadingCover v-if="$calculations.isShowStub"></LoadingCover>
    <div v-else :style="{ width: computedWidth }" class="overflow-hidden">
      <div :style="{ height: computedHeight }" class="table-block">
        <AnalogsTable
          ref="analogsTable"
          :active-analog="activeAnalog"
          :analogs="$calculations.analogs"
          :loading="false"
          :selected-analogs="$calculations.selectedAnalogs"
          :style="showMap ? 'height: ' + tableSplHeight + '%' : 'height: 100%'"
          @navTo="navTo"
          @onRowCtx="onRowCtx"
          @selectAnalog="selectAnalog"
          @setActiveAnalog="
            (analog) => {
              setActiveAnalog(analog)
              if (showMap) {
                ObjectsLayerRef?.fitActiveItem()
              }
            }
          "
        />
        <splitter v-if="showMap" v-model="tableSplHeight" :max="60" :min="20" style="margin: -14px 0"></splitter>
        <MapComponent
          v-if="showMap"
          ref="vMap"
          v-slot="{ map, mapInit }"
          :address-from-map="false"
          :express="false"
          :is-analog-map-modal="false"
          :layers-tree="{}"
          :showCtxMenu="false"
          showFullscreenButton
          style="flex: 1"
        >
          <ObjectsLayer
            ref="ObjectsLayerRef"
            :activeItem="activeAnalog"
            :mode="'onlyRealEstateAnalogsComponent'"
            :items="$calculations.analogs"
            :map="map"
            :mapInit="mapInit"
            @selectAnalog="selectAnalog"
            @on-item-select="
              (item: aimType) => {
                console.log('@on-item-select', item)
                setActiveAnalog(item)
                analogsTable?.scrollToItem(item)
              }
            "
          ></ObjectsLayer>
        </MapComponent>
      </div>
    </div>
    <hr ref="analogsComponentHrRef" class="m-2" />
    <div
      ref="analogsComponentButtonsRef"
      :style="{ width: computedWidth }"
      class="d-flex justify-content-between gap-2"
    >
      <div class="d-flex me-4">
        <div class="me-4">
          <div class="table-footer-text">Автоматически подобрано предложений {{ $calculations.analogsCount }}</div>
          <div class="table-footer-text">Добавлено предложений из общего списка {{ $calculations.analogs.length }}</div>
        </div>
        <div>
          <div class="table-footer-text">
            <span
              ><i class="icon fi_scale-left"></i> Выбрано предложений в расчёт
              {{ $calculations.selectedAnalogs.length }}</span
            >
          </div>
        </div>
      </div>

      <div class="d-flex gap-2 justify-content-end">
        <ButtonWithLoader
          button-class="px-4 fixed-fs-17"
          startIconClass="icon fi_arrow-left me-2"
          value="Назад"
          variant="outline-secondary"
          @click="returnToEvalComp"
        />
        <ButtonWithLoader
          :loading="saving"
          button-class="px-4 fixed-fs-17"
          value="Сохранить"
          variant="outline-secondary"
          @click="() => evaluationSave()"
        />
        <ButtonWithLoader
          :disabled="!$calculations.selectedAnalogs.length"
          button-class="px-4 fixed-fs-17"
          value="Перейти к вычислениям"
          variant="primary"
          @click="navigateToResults()"
        />
      </div>
    </div>
    <!--контекстное меню таблицы аналогов-->
    <ks-dropdown ref="rowCtxMenu" :target="'_body'" drop-pos="pointer">
      <div v-for="buttonData in functionalButtonsData">
        <button
          v-if="buttonData.type === 'button' && buttonData.for.includes('ctx')"
          :disabled="buttonData.disabled"
          class="dropdown-item cursor-pointer"
          @click="buttonData.function"
        >
          <i :class="buttonData.iconClass"></i> {{ buttonData.title }}
        </button>
      </div>
    </ks-dropdown>
    <ModalMessage v-model="infoModal" okOnly title="ИНФОРМАЦИЯ">
      Вы не можете добавить предложение в выборку пока он не проверен
    </ModalMessage>
    <Gallery
      v-if="Object.keys(activeAnalog).length && imgSrcList.length"
      v-model="isGalleryOpen"
      :imgSrcList="imgSrcList"
      :index="0"
    ></Gallery>
  </div>
</template>

<script lang="ts" setup>
import FunctionalButtons from '~/components/UI-KIT/Buttons/ButtonsGroup/FunctionalButtons.vue'
import AnalogsTable from '~/components/ObjectEvaluation/AnalogsComponents/AnalogsTable.vue'
import KsDropdown from '~/components/MapComponent/KsDropdown.vue'
import ObjectsLayer from '~/components/MapComponent/ObjectsLayer.vue'
import MapComponent from '~/components/MapComponent/MapComponent.vue'
import type { aimType } from '~/types/calculationsTypes'
import ModalMessage from '~/components/UI-KIT/Alerts/ModalMessage.vue'
import Gallery from '~/components/UI-KIT/Gallery.vue'
import { pathToImagesLink } from '~/app_constants/filesGroup'
import Splitter from '~/components/UI-KIT/Splitter.vue'
import LoadingCover from '~/components/UI-KIT/Loaders/LoadingCover.vue'
import ButtonWithLoader from '~/components/UI-KIT/Buttons/BaseFormButton.vue'
import { cloneDeep } from 'lodash'
import { useNuxtApp } from 'nuxt/app'

const { $calculations, $baseURL, $userStore, $filtersStore } = useNuxtApp()
const route = useRoute()

const tableSplHeight = ref(40)
const vMap = ref<HTMLElement | null>(null)
const ObjectsLayerRef = ref<InstanceType<typeof ObjectsLayer>>()
const showMap = ref(false)
// const analogs = computed(() => $calculations.analogs)
const activeAnalog: Ref<aimType> = ref({})
const rowCtxMenu: any = ref(null)
const infoModal: Ref<boolean> = ref(false)
const isGalleryOpen: Ref<boolean> = ref(false)
const saving = ref(false)

const imgSrcList = computed(() => {
  const result: { title: string; url: string }[] = []
  if ('ads_screenshot' in activeAnalog.value && activeAnalog.value['ads_screenshot']) {
    result.push({
      title: activeAnalog.value.ads_screenshot?.split('/')[-1],
      url: activeAnalog.value.ads_screenshot?.includes('http')
        ? activeAnalog.value.ads_screenshot
        : $baseURL + pathToImagesLink + activeAnalog.value.ads_screenshot,
    })
  }
  if ('images_links' in activeAnalog.value && activeAnalog.value['images_links']) {
    activeAnalog.value.images_links.forEach((link: string) => {
      if (link) {
        result.push({
          title: link.split('/')[-1],
          url: link.includes('http') ? link : $baseURL + pathToImagesLink + link,
        })
      }
    })
  }
  return result
})
const setActiveAnalog = (analog: aimType) => {
  activeAnalog.value = analog
}
// нажатие правой кнопкой мыши на строку аналога
const onRowCtx = (event: Event, analog: aimType) => {
  activeAnalog.value = analog
  if (rowCtxMenu.value) rowCtxMenu.value.show(event)
}

const selectedAnalogs: Ref<any> = ref([])

const setSelectedAnalog = (analog: aimType) => {
  selectedAnalogs.value = cloneDeep($calculations.selectedAnalogs)
  $calculations.initSelectedAnalogs()
  const isIncludedAnalog = selectedAnalogs.value.some((item: any) => item.id === analog.id)
  if (!isIncludedAnalog) {
    if (analog.is_checked) {
      selectedAnalogs.value.push(analog)
      $calculations.setSelectedAnalogs(selectedAnalogs.value)
    } else {
      infoModal.value = true
    }
  } else {
    selectedAnalogs.value = selectedAnalogs.value.filter((item: any) => item.id !== analog.id)
    $calculations.setSelectedAnalogs(selectedAnalogs.value)
  }
}
const selectAnalog = (analog: aimType) => {
  if ('id' in analog) {
    setSelectedAnalog(analog)
  } else {
    setSelectedAnalog(activeAnalog.value)
  }

  // if (showMap.value) {
  //   setActiveAnalog(analog)
  // }
}

const removeAnalog = () => {
  $calculations.setAnalogs($calculations.analogs.filter((item: any) => item.id !== activeAnalog.value.id))
}

const navTo = (analog: aimType) => {
  if ('id' in analog) {
    navigateTo(`/analog/${analog.id}#Базовые поля`)
  } else {
    navigateTo(`/analog/${activeAnalog.value.id}#Базовые поля`)
  }

  $calculations.setAimPath({
    path: route.path,
    hash: route.hash,
  })
}

const openGallery = () => {
  if (imgSrcList.value.length) {
    isGalleryOpen.value = true
  } else {
    $userStore.setToastMessage('Нет скриншотов для отображения', 'message', 3)
  }
}

// функция по нажатию кнопки Показать карту
const onShowMapClick = () => {
  showMap.value = !showMap.value
}

const newAnalog = () => {
  navigateTo('/analog/0/')
  $calculations.setAimPath({
    path: route.path,
    hash: route.hash,
  })
}

const navigateToResults = async () => {
  await $calculations.navigateToResults()
  navigateTo(`/evaluation/${$calculations.aim.id}/results`)
}

// наблюдение за активным аналогом, чтобы активировать кнопки на панели
watch([() => activeAnalog.value, () => selectedAnalogs.value.length], () => {
  functionalButtonsData.value.forEach((button: any) => {
    if (button.for.includes('ctx')) {
      button.disabled = activeAnalog.value === null
    }
    if (button.title === 'Добавить в расчёт') {
      button.disabled = selectedAnalogs.value.some((item: any) => item.id === activeAnalog.value.id)
    }
  })
})

const openAllAnalogsTable = () => {
  navigateTo(`/evaluation/${$calculations.aim.id}/analogs_table`)
  $calculations.onIsShowStub()
  $calculations.onIsAllAnalogsInSelection()
}

const returnToEvalComp = () => {
  $userStore.setEvaluationComponent('orders')
  $calculations.setOrderName('')
  $calculations.setSavedOrderId(null)
}
// пункты панельных кнопок и контекстного меню с настройками и запуском функций для каждого
const functionalButtonsData: Ref<any> = ref([
  {
    type: 'button',
    for: ['panel'],
    title: 'Добавить новое предложение',
    disabled: false,
    iconClass: 'icon fi_plus-circle',
    function: newAnalog,
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Добавить предложения из общего списка',
    disabled: false,
    iconClass: 'icon fi_plus-circle',
    function: openAllAnalogsTable,
  },
  {
    type: 'button',
    for: ['ctx'],
    title: 'Добавить в расчёт',
    disabled: true,
    iconClass: 'icon fi_scale-left',
    function: selectAnalog,
  },
  {
    type: 'button',
    for: ['panel', 'ctx'],
    title: 'Открыть',
    disabled: true,
    iconClass: 'icon fi_edit-3',
    function: navTo,
  },
  {
    type: 'button',
    for: ['panel', 'ctx'],
    title: 'Скриншот',
    disabled: true,
    iconClass: 'icon fi_image',
    function: openGallery,
  },
  {
    type: 'button',
    for: ['panel', 'ctx'],
    title: 'Удалить из списка',
    disabled: true,
    iconClass: 'icon fi_trash',
    function: removeAnalog,
  },
  {
    type: 'space',
    for: ['panel'],
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Показать карту',
    disabled: false,
    iconClass: 'icon fi_map-pin',
    active: showMap,
    function: onShowMapClick,
  },
])

watch(
  [activeAnalog, $calculations.selectedAnalogs],
  () => {
    functionalButtonsData.value.forEach((button: any) => {
      if (button.for.includes('ctx')) {
        button.disabled = !activeAnalog.value
      }
      if (button.title === 'Добавить в расчёт') {
        button.disabled = $calculations.selectedAnalogs.some((item: any) => item.id === activeAnalog.value?.id)
      }
    })
  },
  { immediate: true },
)

const evaluationSave = () => {
  saving.value = true
  $calculations.evaluationSave().then(() => {
    saving.value = false
  })
}

const analogsComponentFunctionalButtonsRef = ref<HTMLElement | null>(null)
const analogsComponentHrRef = ref<HTMLElement | null>(null)
const analogsComponentButtonsRef = ref<HTMLElement | null>(null)
const computedHeight = ref<string>('')
const computedWidth = ref<string>('')

const resizeObserver = new ResizeObserver(() => {
  const parent = document.querySelector('.map-object-properties_body_content') as HTMLElement
  if (
    parent &&
    analogsComponentFunctionalButtonsRef.value &&
    analogsComponentHrRef.value &&
    analogsComponentButtonsRef.value
  ) {
    const tableHeight =
      parent.clientHeight -
      analogsComponentFunctionalButtonsRef.value.clientHeight -
      analogsComponentHrRef.value.clientHeight -
      analogsComponentButtonsRef.value.clientHeight -
      22
    computedHeight.value = `${tableHeight}px`
  }
  const parentWidth = document.querySelector('.map-object-properties_body') as HTMLElement
  if (parentWidth) {
    computedWidth.value = `${parentWidth.clientWidth - 340}px`
  }
})

onMounted(() => {
  if (analogsComponentFunctionalButtonsRef.value) resizeObserver.observe(analogsComponentFunctionalButtonsRef.value)
  if (analogsComponentHrRef.value) resizeObserver.observe(analogsComponentHrRef.value)
  if (analogsComponentButtonsRef.value) resizeObserver.observe(analogsComponentButtonsRef.value)
})

onBeforeUnmount(() => {
  if (analogsComponentFunctionalButtonsRef.value) resizeObserver.unobserve(analogsComponentFunctionalButtonsRef.value)
  if (analogsComponentHrRef.value) resizeObserver.unobserve(analogsComponentHrRef.value)
  if (analogsComponentButtonsRef.value) resizeObserver.unobserve(analogsComponentButtonsRef.value)
})

const analogsTable = ref<InstanceType<typeof AnalogsTable> | null>(null)
</script>
