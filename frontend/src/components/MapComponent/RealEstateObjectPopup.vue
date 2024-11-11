<template>
  <template v-if="fullLoader && toShowLoader">
    <div class="d-flex align-items-center justify-content-center" style="width: 265px">
      <BSpinner small></BSpinner>
    </div>
  </template>
  <template v-else>
    <div v-if="toShowLoader || fullLoader" :style="imageCssProp" class="m-1 me-2"></div>
    <div class="d-flex flex-column">
      <div class="popup-container_title pb-1" style="width: 265px">
        <span v-if="currentAnalogPopupObject.func_purpose && currentAnalogPopupObject.func_purpose.name"
          >{{ currentAnalogPopupObject.func_purpose.name }},
        </span>
        {{ currentAnalogPopupObject.object_area }} кв.м
      </div>
      <div class="popup-info-container">
        <div style="width: 265px">
          <div
            v-for="popupOption in currentPopupStructure[currentAnalogPopupObject.object_type_calc]"
            :key="popupOption.title"
            class="popup-container_title popup-container_title__sm d-flex"
          >
            <span class="p-0 text-start popup-container_row-title align-top me-1">{{ popupOption.title }}</span>
            <span class="p-0 text-start align-top overflow-y-scroll popup-field-value">
              {{ analogPopupValueGetter(popupOption.field) }}
            </span>
          </div>
        </div>
      </div>

      <div class="popup-container_title popup-container_title__sm pt-1 d-flex h-100 overflow-hidden">
        <span style="max-width: 240px" class="me-1 popup-address-value">{{
          currentAnalogPopupObject.address_raw
        }}</span>

        <button
          v-if="mode === 'onlyRealEstateAnalogsComponent'"
          class="open-item-from-popup align-self-end ms-auto"
          :title="isAddedToCalc ? 'Удалить из расчёта' : 'Добавить в расчёт'"
          @click="emit('setAnalog')"
        >
          <i class="icon" :class="isAddedToCalc ? 'fi_minus' : 'fi_scale-left'" />
        </button>
        <button
          v-else
          class="open-item-from-popup align-self-end ms-auto"
          @click="onOpenObjectClick"
          @click.middle="onOpenObjectClick"
        >
          <i class="icon fi_edit-3" />
        </button>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { objectTypeToText } from '~/app_constants/mergedFieldsConst'
import { calcTypeToPath } from '~/app_constants/routes'

interface Props {
  toShowLoader: boolean
  imageCssProp: Record<string, any>
  currentAnalogPopupObject: Record<string, any>
  mode: string
  fullLoader?: boolean
}
const props = defineProps<Props>()
const emit = defineEmits(['setAnalog'])
const { $calculations } = useNuxtApp()

const analogPopupStructure = [
  {
    title: 'Продажа: ',
    field: 'price_sale',
  },
  {
    title: 'Тип: ',
    field: 'object_type',
  },
  {
    title: 'Статус: ',
    field: 'is_checked',
  },
  {
    title: 'Удельная цена: ',
    field: 'price_sale_per_m',
  },
]

const researchPopupStructure = [
  {
    title: 'Тип: ',
    field: 'object_type',
  },
]
const evaluationPopupStructure = [
  {
    title: 'Тип: ',
    field: 'object_type',
  },
]

const currentPopupStructure: Record<string, any> = {
  OA: analogPopupStructure,
  OO: evaluationPopupStructure,
  NE: researchPopupStructure,
}
function analogPopupValueGetter(field: string) {
  if (field === 'price_sale') {
    return props.currentAnalogPopupObject.price_sale ? props.currentAnalogPopupObject.price_sale + ' р.' : 'нет данных'
  }
  if (field === 'object_type') {
    return objectTypeToText[props.currentAnalogPopupObject.object_type]
  }
  if (field === 'is_checked') {
    return props.currentAnalogPopupObject.is_checked ? 'Проверено' : 'Не проверено'
  }
  if (field === 'price_sale_per_m') {
    return props.currentAnalogPopupObject.price_sale_per_m
      ? props.currentAnalogPopupObject.price_sale_per_m + ' р.'
      : 'нет данных'
  }
  if (field === 'name') {
    return props.currentAnalogPopupObject.name
  }
}

const onOpenObjectClick = (event: MouseEvent) => {
  navigateTo(
    {
      path: `/${calcTypeToPath[props.currentAnalogPopupObject.object_type_calc]}/${props.currentAnalogPopupObject.id}`,
      hash: '#Базовые поля',
    },
    getNavigateOptions(event),
  )
}
const getNavigateOptions = (event: MouseEvent) => {
  return event.button == 1 ? { open: { target: '_blank' } } : {}
}

const isAddedToCalc = computed(() => {
  return $calculations.selectedAnalogs.some((item: any) => item.id === props.currentAnalogPopupObject.id)
})
</script>

<style scoped></style>
