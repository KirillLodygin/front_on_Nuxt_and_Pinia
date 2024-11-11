<template>
  <div v-if="!isBaseFieldsReady && !$geoObject.noNavigateNewCard" class="map-object-properties_footer_alert">
    <i class="icon fi_alert-circle" />Для сохранения карточки необходимо заполнить все обязательные для ввода поля
  </div>

  <div class="d-flex">
    <button
      v-if="$calculations.aimPath.path.length"
      class="ms-2 btn btn-lg btn-outline-secondary p-3 d-flex align-items-center justify-content-center"
      @click="navigateTo($calculations.aimPath)"
    >
      Вернуться к расчётам
    </button>

    <button
      v-if="$geoObject.noNavigateNewCard"
      class="ms-2 btn btn-lg btn-outline-secondary p-3 d-flex align-items-center justify-content-center"
      @click="$geoObject.returnToObjectFromCreatingCard(mutableData.id)"
    >
      Вернуться к объекту недвижимости
    </button>

    <button
      :disabled="!isFormChanged"
      class="ms-2 btn btn-lg btn-outline-secondary p-3 d-flex align-items-center justify-content-center"
      @click="emit('setInitial')"
    >
      Отменить
    </button>

    <div v-if="isNew || !isBaseFieldsReady || !isRequiredFieldsReady" id="save-as-draft" class="ms-2 position-relative">
      <button
        :disabled="saveAsDraftDisabled"
        class="btn btn-lg btn-primary d-flex align-items-center justify-content-center h-100"
        @click="emit('save', false)"
      >
        Сохранить как черновик
      </button>

      <BTooltip
        v-if="tooltipCondition"
        :no-fade="true"
        placement="top"
        target="save-as-draft"
        custom-class="custom-tooltip shadow"
        triggers="hover"
      >
        <div class="save-as-draft-button-tooltip">
          Черновик будет доступен только Вам. Заполните все обязательные поля, чтобы карточку увидели другие
          пользователи. <br />
          <template v-if="$objectStore.objectTypeCalc === 'OA'">
            Вы можете заполнить пустые поля стандартными значениями используя функцию авто-дозаполнения.<br />
          </template>
          {{ msgToRequiredInputs }}
        </div>
      </BTooltip>
    </div>

    <button
      v-else
      :disabled="publishButtonDisabled"
      class="ms-2 btn btn-lg btn-primary d-flex align-items-center justify-content-center"
      @click="emit('save', true)"
    >
      Опубликовать
    </button>
  </div>
</template>

<script lang="ts" setup>
import { photo } from '~/app_constants/mapObjectConsts'
import type { FileType } from '~/types/mapObjectPropertiesTypes'

const { $calculations, $geoObject, $objectStore, $userStore } = useNuxtApp()

interface Props {
  isBaseFieldsReady: boolean
  isRequiredFieldsReady: boolean
  isNew: boolean
  isFormChanged: boolean
  changeHasParent: boolean
  noNavigateNewObject: boolean
  mutableData: Record<string, any>
}

const props = defineProps<Props>()
const emit = defineEmits(['save', 'setInitial'])

const msgToRequiredInputs = computed(() => {
  const labels: string[] = []

  for (const tab in $objectStore.scenarioByTabs) {
    for (const section in $objectStore.scenarioByTabs[tab]) {
      if (!$objectStore.scenarioByTabs[tab][section].completed) {
        $objectStore.scenarioByTabs[tab][section].requiredFields.forEach((field: string) => {
          if (section === photo) {
            const descriptions = props.mutableData.files.map((file: FileType) => file.description)
            if (!descriptions.includes(field)) {
              labels.push(field)
            }
          } else if (!props.mutableData[field] && $objectStore.evoluationMutableOptions[field]) {
            labels.push($objectStore.evoluationMutableOptions[field].objectData.label)
          }
        })
      }
    }
  }
  return 'Обязательные данные для публикации: ' + labels.join(', ')
})

const tooltipCondition = computed(() => props.isBaseFieldsReady && !props.isNew)
const saveAsDraftDisabled = computed(() =>
  props.isNew
    ? !props.isBaseFieldsReady ||
      (!props.mutableData.has_parent && !props.mutableData.not_found_has_parent && !props.noNavigateNewObject)
    : props.changeHasParent
      ? (!props.isBaseFieldsReady && props.isFormChanged) ||
        (!props.mutableData.has_parent && !props.mutableData.not_found_has_parent) ||
        !props.isFormChanged
      : (!props.isBaseFieldsReady && props.isFormChanged) || !props.isFormChanged,
)

const publishButtonDisabled = computed(() =>
  props.changeHasParent
    ? (!props.isBaseFieldsReady &&
        props.isFormChanged &&
        !props.mutableData.has_parent &&
        !props.mutableData.not_found_has_parent) ||
      !props.isFormChanged
    : (!props.isBaseFieldsReady && props.isFormChanged) || !props.isFormChanged,
)
</script>

<style scoped></style>
