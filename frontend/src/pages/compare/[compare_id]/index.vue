<template>
  <div class="w-100 h-100 d-flex flex-column">
    <div class="d-flex align-items-center">
      <h4 class="compare-title w-100 m-0">{{ compareName }}</h4>
      <FunctionalButtons :data="comparePointsFunctionalButtonsData" />
    </div>
    <div v-if="isShowStub" class="table-load-bg">
      <div class="table-load">
        <div class="spinner-border" role="status"></div>
        <div>Загрузка данных...</div>
      </div>
    </div>
    <div v-else class="overflow-y-auto position-relative w-100 mb-2" :class="isShowMap ? 'h-50' : 'h-100'">
      <ComparePointsTable />
    </div>
    <DisplayCompareObjectsMap
      v-if="!isShowStub && isShowMap"
      class="h-50"
      :key="$displayCompareObjectStore.mapRerenderKey + $comparison.currentComparisonObjects.length"
    />
    <AddObjectsToCompareMap v-else-if="!isShowStub && isShowMap" class="h-50" />
    <div class="mt-auto" style="border-top: 1px solid #00000040; padding-top: 0.5rem">
      <CompareFooterButtons />
    </div>
  </div>

  <!--меню сохранения Сравнения-->
  <MiniInfoModal
    v-model="isMiniInfoModalForSave"
    :title="'Сохранить сравнение'"
    :icon="'fi_save'"
    :footer-btn-title="'Сохранить'"
    :size="'md'"
    @onCloseModelValue="onCloseModelValue"
    @onRefuseChanges="onRefuseChanges"
    @onSaveChanges="onSaveChanges"
  >
    <template v-slot:content>
      <div class="file-rename_label">Название</div>
      <div class="input-group mb-3">
        <input
          type="text"
          class="form-control form-control-lg map-object-properties_body_input"
          aria-label="Сохраненное сравнение"
          aria-describedby="file-rename"
          :value="compareNewLabel || compareName"
          @input="
            (event) => {
              setCompareNewLabel(event)
            }
          "
        />
      </div>
      <div class="file-rename_label">Описание</div>
      <div class="input-group mb-3">
        <textarea
          type="text"
          class="form-control form-control-lg map-object-properties_body_input custom-textarea"
          aria-label="Сохраненное сравнение"
          aria-describedby="file-rename"
          :value="description"
          @input="
            (event) => {
              setDescription(event)
            }
          "
        />
      </div>
    </template>
  </MiniInfoModal>

  <ModalMessage v-model="isAlert" @onCloseWindow="onCloseAlertWindow" :okOnly="true" title="">
    Сохранение прошло успешно
  </ModalMessage>

  <ModalMessage
    v-model="isAlertInfoOpen"
    okOnly
    title="ОШИБКА СОХРАНЕНИЯ"
    variant="danger"
    @closeAlertInfo="closeAlertInfo"
  >
    Сохранение с таким именем уже существует! Задайте другое имя
  </ModalMessage>

  <ModalMessage
    v-model="isAlertQuestionOpen"
    :title="'Перезаписать текущее сохранение?'"
    variant="danger"
    :okTitle="'Перезаписать'"
    :cancelTitle="'Создать новое'"
    @rejectAction="createNewSave"
    @closeAlertInfo="overwriteSave"
    @onCloseWindow="onCloseAlertQuestion"
  >
    Хотите перезаписать текущее сохранение или создать новое?
  </ModalMessage>

  <ModalMessage
    v-model="isCleanAlertOpen"
    :title="'Обнулить текущее сравнение?'"
    variant="danger"
    :okTitle="'Очистить'"
    :cancelTitle="'Оставить'"
    @rejectAction="onCloseCleanAlert"
    @closeAlertInfo="onCleanCompare"
    @onCloseWindow="onCloseCleanAlert"
  >
    Вы сохранили сравнение. Очистить текущее сравнение?
  </ModalMessage>

  <ModalSaveWindow />
</template>

<script lang="ts" setup>
import { navigateTo, useNuxtApp, useRoute } from 'nuxt/app'
import { computed, ref, onMounted } from 'vue'
import { currentComparisonList } from '~/app_constants/comparisonConsts'

import FunctionalButtons from '~/components/UI-KIT/Buttons/ButtonsGroup/FunctionalButtons.vue'
import ComparePointsTable from '~/components/GeoObject/compare/ComparePointsTable.vue'
import DisplayCompareObjectsMap from '~/components/GeoObject/compare/DisplayCompareObjectsMap.vue'
import AddObjectsToCompareMap from '~/components/GeoObject/compare/AddObjectsToCompareMap.vue'
import CompareFooterButtons from '~/components/GeoObject/compare/CompareFooterButtons.vue'
import MiniInfoModal from '~/components/UI-KIT/Modals/MiniInfoModal.vue'
import ModalMessage from '~/components/UI-KIT/Alerts/ModalMessage.vue'
import ModalSaveWindow from '~/components/GeoObject/compare/ModalSaveWindow.vue'

const { $comparison, $displayCompareObjectStore } = useNuxtApp()

const compareName = computed(() => $comparison.compareName)
const isShowStub = computed(() => $comparison.isShowStub)
const isShowMap = computed(() => $comparison.isShowMap)
const isComparisonModal = computed(() => $comparison.isComparisonModal)
const isMiniInfoModalForSave = computed(() => $comparison.isMiniInfoModalForSave)
const compareNewLabel = computed(() => $comparison.compareNewLabel)
const description = computed(() => $comparison.description)
const currentComparisonObjectsLength = computed(() => $comparison.currentComparisonObjects.length)
const savedCompareId = computed(() => $comparison.savedCompareId)
const previousCompareId = computed(() => $comparison.previousCompareId)
const isAlertQuestionOpen = computed(() => $comparison.isAlertQuestionOpen)
const isAlert = computed(() => $comparison.isAlert)
const isCleanAlertOpen = computed(() => $comparison.isCleanAlertOpen)
const comparePointsFunctionalButtonsData = computed((): any[] => [
  {
    type: 'space',
    for: ['panel'],
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Параметры сравнения',
    disabled: false,
    iconClass: 'icon fi_compare',
    function: showIsComparisonModal,
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Показать карту',
    disabled: false,
    iconClass: 'icon fi_map-pin',
    active: isShowMap.value,
    function: () => {
      $comparison.switchIsShowMap()
    },
  },
])

const isAlertInfoOpen = ref(false)

onMounted(() => {
  if (!currentComparisonObjectsLength.value) {
    $comparison.onIsShowStub()
    $comparison.setSavedComparisons().then(() => {
      const route = useRoute()
      if (!Number(route.path.split('/').reverse()[0])) {
        navigateTo(`/compare`)
        $comparison.offIsShowStub()
      } else {
        $comparison.setCompareId(Number(route.path.split('/').reverse()[0]))
        $comparison.changeCurrentComparisonObjects()
        $comparison.offIsShowStub()
      }
    })
  }
})

function showIsComparisonModal() {
  $comparison.changeIsComparisonModal(true)
}

const setDescription = (event: Event) => {
  const target = event.target as HTMLInputElement
  $comparison.setDescription(target.value)
}

const onCloseModelValue = () => {
  $comparison.setCompareNewLabel('')
  $comparison.setDescription('')
  $comparison.onIsMiniInfoModalForSave(false)
  $comparison.offIsShowSavingStub()
}

const onRefuseChanges = () => {
  $comparison.offIsShowSavingStub()
}

const onSaveChanges = () => {
  if ($comparison.isSavingImpossible()) {
    isAlertInfoOpen.value = true
    return
  }

  $comparison.compareSave().then(() => {
    $comparison.offIsShowSavingStub()
    $comparison.onIsAlert(true)
    $comparison.onIsMiniInfoModalForSave(false)
  })
}

const closeAlertInfo = () => {
  $comparison.setCompareNewLabel('Новое сохранение')
  $comparison.onIsMiniInfoModalForSave(true)
}

const setCompareNewLabel = (event: Event) => {
  const target = event.target as HTMLInputElement
  $comparison.setCompareNewLabel(target.value)
}

const overwriteSave = () => {
  $comparison.onIsAlertQuestionOpen(false)

  $comparison.compareSave().then(() => {
    $comparison.offIsShowSavingStub()
    $comparison.onIsAlert(true)
    $comparison.onIsMiniInfoModalForSave(false)
  })
}

const createNewSave = () => {
  $comparison.onIsAlertQuestionOpen(false)
  $comparison.setCompareNewLabel('Новое сохранение')
  $comparison.setDescription('')
  $comparison.setSavedCompareId('')
  $comparison.onIsMiniInfoModalForSave(true)
  $comparison.onIsShowSavingStub()
}

const onCloseAlertWindow = () => {
  $comparison.onIsAlert(false)

  if (previousCompareId.value === currentComparisonList) {
    $comparison.onIsCleanAlertOpen(true)
    return
  }

  navigateTo(`/compare/${savedCompareId.value}`)
}

const onCloseAlertQuestion = () => {
  $comparison.onIsAlertQuestionOpen(false)
}

const onCloseCleanAlert = () => {
  $comparison.onIsCleanAlertOpen(false)
}

const onCleanCompare = () => {
  $comparison.onIsCleanAlertOpen(false)
  $comparison.onClearCompare()
  navigateTo(`/compare/${savedCompareId.value}`)
}
</script>

<style scoped></style>
