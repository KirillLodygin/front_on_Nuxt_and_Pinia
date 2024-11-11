<template>
  <div class="row p-0 h-100">
    <div class="col">
      <ButtonWithLoader
        :value="'Вернуться к выбору объектов'"
        button-class="px-4 fixed-fs-17"
        height="100%"
        start-icon-class="icon fi_arrow-left me-2"
        variant="outline-secondary"
        @click="() => resetComparisonObjects()"
      />
    </div>

    <div class="col-9 d-flex gap-2 justify-content-end h-100">
      <ButtonWithLoader
        :loading="isShowSavingStub"
        variant="primary"
        button-class="px-4 fixed-fs-17"
        height="100%"
        start-icon-class="icon fi_save me-2"
        value="Сохранить сравнение"
        @click="() => onSaveCompare()"
      />
      <ButtonWithLoader
        variant="secondary"
        button-class="px-4 fixed-fs-17"
        height="100%"
        start-icon-class="icon fi_file-text me-2"
        value="Скачать отчёт"
        @click="() => exportExcel()"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useNuxtApp, navigateTo } from 'nuxt/app'
import { currentComparisonList, COMPARE } from '~/app_constants/comparisonConsts'

import ButtonWithLoader from '~/components/UI-KIT/Buttons/BaseFormButton.vue'

const { $comparison } = useNuxtApp()
const isShowSavingStub = computed(() => $comparison.isShowSavingStub)
const compareId = computed(() => $comparison.compareId)

const resetComparisonObjects = () => {
  $comparison.setSavedComparisons().then(() => {
    navigateTo(`/${COMPARE}`)
    $comparison.resetAuxiliaryValues()
    $comparison.isUpdateComparisonObjects([])
    $comparison.resetActiveComparisonItem()
  })
}

const onSaveCompare = () => {
  if (compareId.value === currentComparisonList) {
    $comparison.onIsMiniInfoModalForSave(true)
    $comparison.setDescription('')
    $comparison.onIsShowSavingStub()
    return
  }
  $comparison.onIsAlertQuestionOpen(true)
}

const exportExcel = () => {
  $comparison.exportExcel()
}
</script>
