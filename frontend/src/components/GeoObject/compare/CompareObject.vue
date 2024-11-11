<template>
  <div class="h-100">
    <h1 class="page-header">СРАВНЕНИЕ ОБЪЕКТОВ</h1>
    <CompareTree
      @setIsMiniInfoModal="setIsMiniInfoModal"
      @setIsComparisonModal="setIsComparisonModal"
      :set-tab-name="setTabName"
    />
  </div>
  <CompareObjectTableWrapper :set-tab-name="setTabName" />

  <ModalMessage
    v-model="isAlertSaveChangesOpen"
    :title="'Сохранить изменения в текущем наборе?'"
    variant="danger"
    :okTitle="'Сохранить'"
    :cancelTitle="'Не сохранять'"
    @rejectAction="doNotSaveChanges"
    @closeAlertInfo="overwriteSave"
    @onCloseWindow="doNotSaveChanges"
  >
    Хотите перезаписать текущее сохранение или создать новое?
  </ModalMessage>

  <ModalMessage v-model="isAlert" @onCloseWindow="onCloseAlertWindow" :okOnly="true" title="">
    Сохранение прошло успешно
  </ModalMessage>

  <ModalMessage
    v-model="isAlertSaveDeleteOpen"
    :title="'Удалить текущий набор?'"
    variant="danger"
    :okTitle="'Удалить'"
    :cancelTitle="'Не сохранять'"
    @rejectAction="doNotDelete"
    @closeAlertInfo="deleteCompare"
    @onCloseWindow="doNotDelete"
  >
    {{ `Вы удалили все объекты в сохранении '${compareName}', хотите удалить сохранение ?` }}
  </ModalMessage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { currentComparisonList } from '~/app_constants/comparisonConsts'
import CompareTree from '~/components/GeoObject/compare/CompareTree.vue'
import CompareObjectTableWrapper from '~/components/GeoObject/compare/CompareObjectTableWrapper.vue'
import ModalMessage from '~/components/UI-KIT/Alerts/ModalMessage.vue'

interface Props {
  setTabName: (tab: string) => void
}

const props = defineProps<Props>()

const { $comparison } = useNuxtApp()

const isAlert = computed(() => $comparison.isAlert)
const isAlertSaveChangesOpen = computed(() => $comparison.isAlertSaveChangesOpen)
const isAlertSaveDeleteOpen = computed(() => $comparison.isAlertSaveDeleteOpen)
const compareId = computed(() => $comparison.compareId)
const compareName = computed(() => $comparison.compareName)

const emit = defineEmits(['setIsMiniInfoModal', 'setIsComparisonModal'])

const isOpenNewComparisonObjects = () => {
  $comparison.resetActiveComparisonItem()
  $comparison.changeCurrentComparisonObjects()
}

const onCloseAlertWindow = () => {
  $comparison.onIsAlert(false)
}

const doNotDelete = () => {
  $comparison.onIsAlertSaveDeleteOpen(false)
}

function deleteCompare() {
  if (compareId.value) {
    $comparison.deleteCompare()
  }
  $comparison.onIsAlertSaveDeleteOpen(false)
}

const doNotSaveChanges = () => {
  $comparison.onIsAlertSaveChangesOpen(false)
  isOpenNewComparisonObjects()
}

const overwriteSave = () => {
  $comparison.onIsAlertSaveChangesOpen(false)
  $comparison.onIsShowStub()

  $comparison.compareSave().then(() => {
    $comparison.offIsShowStub()
    $comparison.onIsAlert(true)
    props.setTabName(`${compareId.value === currentComparisonList ? compareId.value : compareName.value}`)
    isOpenNewComparisonObjects()
  })
}

const setIsMiniInfoModal = (bool: boolean) => {
  emit('setIsMiniInfoModal', bool)
}

const setIsComparisonModal = () => {
  emit('setIsComparisonModal', true)
}
</script>

<style scoped></style>
