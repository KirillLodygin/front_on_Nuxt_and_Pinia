<template>
  <div class="map-object-properties_header">
    <div class="map-object-properties_header_data d-flex flex-column justify-conetnt-center">
      <span class="map-object-properties_header_data_text map-object-properties_header_data_text__main">
        ОБЪЕКТ ОЦЕНКИ
      </span>
    </div>
    <div class="map-object-properties_header_data d-flex flex-column justify-conetnt-center">
      <span class="map-object-properties_header_data_text">идентификатор</span>
      <span class="d-flex justify-content-start align-items-center">{{ $calculations.aim.id }}</span>
    </div>
    <div class="map-object-properties_header_data d-flex flex-column justify-conetnt-center">
      <span class="map-object-properties_header_data_text">адрес</span>
      <span class="d-flex justify-content-start align-items-center">{{
        $calculations.aim.address_raw ? $calculations.aim.address_raw : '-'
      }}</span>
    </div>
    <div class="map-object-properties_header_data d-flex flex-column justify-conetnt-center">
      <span class="map-object-properties_header_data_text">дата оценки</span>
      <span class="d-flex justify-content-start align-items-center">{{
        $calculations.aim.date_calc ? $calculations.aim.date_calc && $calculations.aim.date_calc.split('T')[0] : '-'
      }}</span>
    </div>
    <div v-if="isExpress" class="map-object-properties_header_data d-flex flex-column justify-conetnt-center">
      <span class="map-object-properties_header_data_text">аналогов в подборке</span>
      <span class="d-flex justify-content-start align-items-center">{{ analogsLength }}</span>
    </div>
    <div class="ms-auto"></div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useNuxtApp } from 'nuxt/app'

const { $calculations } = useNuxtApp()

const analogsLength = computed(() => $calculations.currentAnalogs.length)
const isExpress = computed(() => $calculations.isExpress)
</script>
