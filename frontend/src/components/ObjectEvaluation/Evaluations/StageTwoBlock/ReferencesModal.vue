<template>
  <BModal
    id="reference-modal"
    v-model="toggle"
    :class="{ 'd-block': toggle }"
    :dialog-class="['reference-modal-dialog', { mini: !isViewSource }]"
    _contentClass="shadow border-primary"
    _headerVariant="primary"
    cancel-title="Отмена"
    cancel-variant="outline-secondary"
    contentClass="shadow"
    ok-title="Применить"
    @cancel="() => cancel()"
    @ok="() => ok()"
  >
    <template #title>
      <slot name="title">
        <i class="icon icon-lg fi_sliders me-1" />
        ВЫБРАТЬ СПРАВОЧНИК
      </slot>
    </template>

    <div class="row">
      <div :class="['px-4', { col: !isViewSource }, { 'col-3': isViewSource }]">
        <div class="mb-3">Показатель "{{ getFieldName(fieldForCorrection) }}"</div>
        <div class="mb-1 fs-6">Источник</div>
        <BButtonGroup :class="['w-100 reference-modal-buttons-group', { mini: isViewSource }]">
          <BButton
            v-for="(sourceName, index) of sourcesNames"
            :active="defaultSource === sourceName.display_name"
            class=""
            variant="outline-secondary"
            @click="() => setActiveSourceTabIndex(index)"
          >
            {{ sourceName.display_name }}
          </BButton>
        </BButtonGroup>
        <div v-if="defaultSource !== 'Ручное'" :key="`${$calculations.getFieldName(fieldForCorrection)}`">
          <Switcher v-model="isViewSource" class="w-100 mt-2" label="Посмотреть источник" />
          <div class="mb-1 fs-6">Дата</div>
          <ReferenceOptionSelect
            :default-value="defaultDate"
            :field="'dateOptions'"
            :options="dateOptions"
            @setData="$calculations.inputDate"
          />
          <div class="mb-1 fs-6">Регион</div>
          <ReferenceOptionSelect
            :default-value="defaultRegion"
            :field="'regionOptions'"
            :options="regionOptions"
            @setData="$calculations.inputRegion"
          />
          <div v-if="useIsShowMarketTypeSelect()" class="mb-1 fs-6">Тип рынка</div>
          <ReferenceOptionSelect
            v-if="useIsShowMarketTypeSelect()"
            :default-value="defaultMarketType"
            :field="'marketTypeOptions'"
            :options="marketTypeOptions"
            @setData="$calculations.inputMarketType"
          />
          <template v-if="typeData !== 'M'">
            <div class="mb-1 fs-6">Значение корректировки</div>
            <ReferenceOptionSelect
              :default-value="defaultValueCol"
              :field="'valueOptions'"
              :options="valueOptions"
              @setData="$calculations.inputValueCol"
            />
          </template>
        </div>
        <div v-else>
          <div class="alert d-flex align-items-top px-0 m-0">
            <i class="icon icon-lg fi_alert-circle mt-1" style="flex: 0 0 2.5rem"></i>
            При ручном заполнении необходимо обосновать введённые данные. Для этого введите комментарий. При
            необходимости, добавьте нужные документы
          </div>
          <div class="mb-1 fs-6">Примечание *</div>
          <textarea
            v-model="notesObject[fieldForCorrection]"
            class="w-100 rounded-2 custom-textarea"
            rows="4"
            @input="setNoteObjectField($event)"
          />
          <div class="mb-1 fs-6">Документы</div>
          <div>
            <FileInput height="66%" multiple @get-files="fileUpload" />
          </div>
          <div class="references-modal-files-div mt-3 rounded-2">
            <div v-for="(file, index) of files" class="row align-items-center d-flex ms-1 me-1">
              <i class="col-1 icon fi_alert-circle padding-1" />
              <span class="col-8 file-name">{{ file.name }}</span>
              <i class="col-1 icon fi_trash padding-1 ms-auto" @click="deleteFile(file)" />
            </div>
          </div>
        </div>
      </div>
      <div v-if="isViewSource" class="col-9 border-start">
        <TableDetailed :meaning="referenceBooks" />
      </div>
    </div>

    <template #footer="{ ok, cancel }">
      <slot name="footer" v-bind="{ ok, cancel }"></slot>
    </template>
  </BModal>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import { useIsShowMarketTypeSelect } from '~/composables/Calculations/useIsShowMarketTypeSelect'
import Switcher from '~/components/UI-KIT/Selects/Switcher.vue'
import ReferenceOptionSelect from '~/components/UI-KIT/Selects/ReferenceOptionSelect.vue'
import TableDetailed from '~/components/UI-KIT/Table/TableDetailed.vue'
import FileInput from '~/components/UI-KIT/Inputs/FileInput.vue'

interface Props {
  modelValue: boolean
  files: any
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  files: [],
})

const { $calculations } = useNuxtApp()

const fieldForCorrection = computed(() => $calculations.fieldForCorrection)
const notesObject = computed(() => $calculations.notesObject)
const sourcesNames = computed(() => $calculations.getSourceOptions())
const defaultSource = computed(
  () =>
    $calculations.fieldForCorrection && $calculations.referenceBooksSelected[$calculations.fieldForCorrection]?.source,
)
const defaultDate = computed(
  () =>
    $calculations.fieldForCorrection && $calculations.referenceBooksSelected[$calculations.fieldForCorrection]?.group,
)
const defaultRegion = computed(
  () =>
    $calculations.fieldForCorrection && $calculations.referenceBooksSelected[$calculations.fieldForCorrection]?.book,
)
const defaultMarketType = computed(() => $calculations.defaultMarketType)
const defaultValueCol = computed(
  () =>
    $calculations.fieldForCorrection &&
    $calculations.referenceBooksSelected[$calculations.fieldForCorrection]?.valueCol,
)
const dateOptions = computed(() => $calculations.getDateOptions())
const regionOptions = computed(() => $calculations.getRegionOptions())
const marketTypeOptions = computed(() => $calculations.getMarketTypeOptions())
const valueOptions = computed(() => $calculations.getValueOptions())
const referenceBooks = computed(() => $calculations.getCurrentReferenceBook())
const typeData = computed(() => $calculations.getTypeDataForReferenceBookForFieldForCorrection())

const emit = defineEmits(['update:modelValue', 'fileUpload', 'deleteFile'])
const toggle = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    $calculations.setFieldForCorrection('')
    emit('update:modelValue', value)
  },
})

const ok = () => {
  console.log('OK')
}

const cancel = () => {
  console.log('CANCEL')
}

const isViewSource = ref(false)

const activeSourceTabindex: Ref<number> = ref(0)

const setActiveSourceTabIndex = (index: number) => {
  activeSourceTabindex.value = index
  const source = sourcesNames.value[index].value
  $calculations.inputSource(source)
  if (source === 'Ручное') {
    isViewSource.value = false
    $calculations.resetCorrectionField()
  }
}

const fileUpload = (files: any) => {
  emit('fileUpload', files)
}

const deleteFile = (file: any) => {
  emit('deleteFile', file)
}

const setNoteObjectField = (e: Event) => {
  $calculations.setNoteObjectField((e.target as HTMLInputElement).value)
}

const getFieldName = (fieldForCorrection: string) => {
  if (fieldForCorrection === 'utilities') {
    return $calculations.getFieldName('utilities') + ' и ' + $calculations.getFieldName('operating_costs')
  }

  return $calculations.getFieldName(fieldForCorrection)
}
</script>
