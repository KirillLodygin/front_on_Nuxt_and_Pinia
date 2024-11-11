<template>
  <MapObjectPropertiesInput
    :data="mutableData.geo_pos.coordinates[1]"
    :disabled="mutableData.func_purpose?.name === 'Прочее'"
    :field="'coord_lat'"
    :mutable-data="mutableData"
    :object-data="{
      label: 'Координаты: широта',
      type: 'decimal',
    }"
    :required="info ? false : true"
    :index="1"
    :disabled-modifier="disabledModifier"
    @update-mutable-data="(field, value) => emit('updateMutableData', field, value)"
  ></MapObjectPropertiesInput>
  <div v-if="info" :style="{ order: 5 }" :class="`col-${'6'}`" class="inherit-from-text py-2 d-flex align-items-center">
    <i class="icon fi_inner-link-alt me-2" />
    {{ info }}
  </div>
  <MapObjectPropertiesInput
    :data="mutableData.geo_pos.coordinates[0]"
    :disabled="mutableData.func_purpose?.name === 'Прочее'"
    :field="'coord_lng'"
    :mutable-data="mutableData"
    :object-data="{
      label: 'Координаты: долгота',
      type: 'decimal',
    }"
    :required="info ? false : true"
    :index="2"
    :disabled-modifier="disabledModifier"
    @update-mutable-data="(field, value) => emit('updateMutableData', field, value)"
  ></MapObjectPropertiesInput>
  <div v-if="info" :style="{ order: 6 }" :class="`col-${'6'}`" class="inherit-from-text py-2 d-flex align-items-center">
    <i class="icon fi_inner-link-alt me-2" />
    {{ info }}
  </div>
  <div v-if="!hideSearchAddress" class="d-flex mt-2 align-items-center col-12 order-5">
    <button
      class="btn btn-link p-0 me-1"
      :disabled="mutableData.func_purpose?.name === 'Прочее' || disabledComputed"
      @click="changeAddress"
    >
      Найти адрес по координатам
    </button>
    <BSpinner v-if="addressLoading" variant="primary" small />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import MapObjectPropertiesInput from '~/components/MapObjectProperties/Fields/MapObjectPropertiesInput.vue'
import { useChangeAddress } from '~/composables/useChangeAddress'

const props = defineProps<{
  mutableData: { [key: string]: any }
  disabledModifier: boolean
  hideSearchAddress?: boolean
  info?: string
  onlyBuildings?: boolean
}>()
const emit = defineEmits(['updateMutableData', 'buildingNotFound'])

// Использование глобальных объектов и состояний
const { $objectStore, $searchServer } = useNuxtApp()
const addressLoading = ref(false)
let loadController: AbortController | null = null

// Использование useChangeAddress с прямым объектом mutableData
const { changeAddress } = useChangeAddress(props.mutableData, emit, props.onlyBuildings)

// Дополнительные computed свойства для работы с объектом $objectStore
const keysByObj = computed(() => $objectStore.keysByObj)
const disabledComputed = computed(() => props.disabledModifier)

// Функция для логирования событий
function log(e: any) {
  console.log(e)
}
</script>

<style scoped></style>
