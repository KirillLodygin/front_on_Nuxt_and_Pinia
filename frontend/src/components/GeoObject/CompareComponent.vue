<template>
  <div class="table-wrapper page-card h-100">
    <div class="content-block">
      <CompareObject
        @setIsMiniInfoModal="setIsMiniInfoModal"
        @setIsComparisonModal="setIsComparisonModal"
        :set-tab-name="setTabName"
      />

      <!--меню сохранения Сравнения-->
      <MiniInfoModal
        v-model="isMiniInfoModal"
        :title="'ПЕРЕИМЕНОВАТЬ'"
        :icon="'fi_edit-3'"
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
              :value="comparisonObjectLabel || label"
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

      <ModalMessage
        v-model="isAlertInfoOpen"
        okOnly
        title="ОШИБКА ПЕРЕИМЕНОВАНИЯ"
        variant="danger"
        @closeAlertInfo="closeAlertInfo"
      >
        Сохранение с таким именем уже существует! Задайте другое имя
      </ModalMessage>

      <ModalSaveWindow />

      <MiniInfoModal
        v-model="isMapPointModal"
        :title="'ДОБАВИТЬ ТОЧКУ НА КАРТУ'"
        :icon="'fi_edit-3'"
        :footer-btn-title="'Добавить'"
        :size="'md'"
        @onCloseModelValue="onCloseMapPointModal"
        @onRefuseChanges="onRefuseComparison"
        @onSaveChanges="addCompareObjectFromPoint"
      >
        <template v-slot:content>
          <div class="file-rename_label">Точка в сравнение</div>
          <div class="input-group mb-3">
            <input
              type="text"
              class="form-control form-control-lg map-object-properties_body_input"
              aria-label=""
              aria-describedby="file-rename"
              :value="gePosLabel"
              @input="
                (event) => {
                  setGeoPosNewLabel(event)
                }
              "
            />
          </div>
        </template>
      </MiniInfoModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo, useNuxtApp, useRoute } from 'nuxt/app'
import { computed, onMounted, ref } from 'vue'
import { COMPARE, currentComparisonList } from '~/app_constants/comparisonConsts'

import CompareObject from '~/components/GeoObject/compare/CompareObject.vue'
import MiniInfoModal from '~/components/UI-KIT/Modals/MiniInfoModal.vue'
import ModalMessage from '~/components/UI-KIT/Alerts/ModalMessage.vue'
import ModalSaveWindow from '~/components/GeoObject/compare/ModalSaveWindow.vue'

const { $comparison, $objectStore } = useNuxtApp()
const isMiniInfoModal = ref(false)
const isAlertInfoOpen = ref(false)
const label = ref('')

const comparisonObjectLabel = computed(() => $comparison.compareLabel)
const isComparisonModal = computed(() => $comparison.isComparisonModal)
const isMapPointModal = computed(() => $comparison.isMapPointModal)
const gePosLabel = computed(() =>
  $comparison.geoPos.label ? $comparison.geoPos.label : `[${$comparison.geoPos.lon}, ${$comparison.geoPos.lat}]`,
)
const description = computed(() => $comparison.description)
const compareNewLabel = computed(() => $comparison.compareNewLabel)
const compareId = computed(() => $comparison.compareId)
const isClearCompare = computed(() => $comparison.isClearCompare)

const route = useRoute()

onMounted(() => {
  $comparison.switchIsCompareStart(false)
  if (!!compareId.value) {
    const name = compareId.value !== currentComparisonList ? `Сравнение_${compareId.value}` : compareId.value
    navigateTo({ hash: `#${name}` })
    $objectStore.setTabNames([COMPARE, `#${name}`])
  } else {
    $objectStore.setTabNames([COMPARE])
    navigateTo({ hash: `` })
  }
  if (isClearCompare.value) {
    $comparison.isClearComparisonObjects()
  }
})

watch(
  () => route.hash,
  (newVal) => {
    if (!newVal) {
      $comparison.isUpdateComparisonObjects([])
      $comparison.resetAuxiliaryValues()
      return
    }
    $objectStore.setTabNames([COMPARE, newVal])
    $comparison.isOpenCompareByRoute(newVal.slice(1))
  },
)

function setTabName(name: string) {
  navigateTo({ hash: `#${name}` })
}

const setIsMiniInfoModal = (bool: boolean) => {
  isMiniInfoModal.value = bool
}

const setIsComparisonModal = (bool: boolean) => {
  $comparison.changeIsComparisonModal(bool)
}

const onCloseModelValue = () => {
  isMiniInfoModal.value = false
  $comparison.resetAuxiliaryValues()
}

const setCompareNewLabel = (event: Event) => {
  const target = event.target as HTMLInputElement
  $comparison.setCompareNewLabel(target.value)
}

const setDescription = (event: Event) => {
  const target = event.target as HTMLInputElement
  $comparison.setDescription(target.value)
}

const setGeoPosNewLabel = (event: Event) => {
  const target = event.target as HTMLInputElement
  $comparison.setGeoPosNewLabel(target.value)
}

const onRefuseChanges = () => {
  $comparison.resetAuxiliaryValues()
}

const onSaveChanges = () => {
  if ($comparison.isSavingImpossible()) {
    label.value = comparisonObjectLabel.value
    isAlertInfoOpen.value = true
    return
  }
  $comparison.setCompareNewName()
}

const closeAlertInfo = () => {
  isMiniInfoModal.value = true
}

const onRefuseComparison = () => {
  console.log('onRefuseComparison')
}

const onCloseMapPointModal = () => {
  $comparison.isMapPointModalOff()
}

const addCompareObjectFromPoint = async () => {
  await $comparison.addCompareObjectFromPoint()
}
</script>
