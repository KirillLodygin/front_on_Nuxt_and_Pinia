<template>
  <div v-if="!$geoObject.isBaseFieldsReady" class="map-object-properties_footer_alert ms-auto">
    <i class="icon fi_alert-circle" />Для сохранения карточки необходимо заполнить все обязательные для ввода поля
  </div>
  <ButtonWithLoader
    v-if="comparisonObjectsLength"
    :value="'Назад к сравнению'"
    button-class="px-4 fixed-fs-17"
    height="100%"
    start-icon-class="icon fi_arrow-left me-2"
    variant="outline-secondary"
    @click="
      () => {
        navigateTo(`/compare`)
      }
    "
  />
  <div class="d-flex" :class="!$geoObject.isBaseFieldsReady ? 'ms-2' : 'ms-auto'">
    <button
      :disabled="!$geoObject.isFormChanged"
      class="btn btn-lg btn-outline-secondary p-3 d-flex align-items-center justify-content-center"
      @click="handleSetInitial"
    >
      Отменить
    </button>

    <button
      :disabled="(!$geoObject.isBaseFieldsReady && $geoObject.isFormChanged) || !$geoObject.isFormChanged"
      class="ms-2 btn btn-lg btn-primary d-flex align-items-center justify-content-center"
      @click="handleSave"
    >
      Сохранить
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import ButtonWithLoader from '~/components/UI-KIT/Buttons/BaseFormButton.vue'

const { $geoObject, $comparison } = useNuxtApp()

const comparisonObjectsLength = computed(() => $comparison.currentComparisonObjects.length)
const compareId = computed(() => $comparison.compareId)

const handleSetInitial = (event: MouseEvent) => {
  $geoObject.setInitial()
}

const handleSave = (event: MouseEvent) => {
  $geoObject.save()
}
</script>

<style scoped></style>
