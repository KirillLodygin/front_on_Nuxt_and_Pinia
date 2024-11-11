<template>
  <tr>
    <td v-if="props.tabTitle !== stageTabName2 && props.tabTitle !== stageTabName3"></td>
    <td>
      <div class="row m-1 justify-content-around">
        <div class="col p-0">
          {{ getFieldName(props.field) }}
        </div>
        <div class="col-3 h-100">
          <div
            :class="[
              'analogs-carousel-func btn btn-sm-rounded',
              $calculations.getCorrectionButtonStyle(props.field, props.tabTitle),
            ]"
            @click="() => setReferencesModal(props.field)"
          >
            <i class="icon fi_sliders order" />
          </div>
        </div>
      </div>
    </td>
    <td>
      <ReferenceOptionSelect
        :key="`${aim[props.field]}_${referenceBooksSelected[props.field].source}`"
        :default-value="getDefaultAimValueForFieldWithValuesAccordingGuide(props.field)"
        :disabled="referenceBooksSelected[props.field].source === 'Ручное'"
        :field="props.field"
        :index="0"
        :options="useFieldsWithValuesAccordingGuideChoices(props.field)"
        @setData="
          (value) => {
            $calculations.setNewAimFieldValue(value, props.field)
          }
        "
      />
    </td>
    <td v-for="(analog, index) of displayedAnalogs">
      <ReferenceOptionSelect
        :key="`${getAnalogIndex(analog)}${analog[props.field]}${ACCORDING_GUIDE}_${referenceBooksSelected[props.field].source}`"
        :default-value="getDefaultAnalogValueForFieldWithValuesAccordingGuide(analog, props.field)"
        :disabled="referenceBooksSelected[props.field].source === 'Ручное'"
        :field="props.field"
        :index="getAnalogIndex(analog) + 1"
        :options="useFieldsWithValuesAccordingGuideChoices(props.field)"
        @setData="
          (value) => {
            $calculations.setNewAnalogFieldValue(value, props.field, getAnalogIndex(analog))
          }
        "
      />
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import { ACCORDING_GUIDE, stageTabName2, stageTabName3 } from '~/app_constants/calculationsConsts'
import { useFieldsWithValuesAccordingGuideChoices } from '~/composables/Calculations/useFieldsWithValuesAccordingGuideChoices'
import { useDefaultAimValueForFieldWithValuesAccordingGuide } from '~/composables/Calculations/useDefaultAimValueForFieldWithValuesAccordingGuide'
import { useDefaultAnalogValueForFieldWithValuesAccordingGuide } from '~/composables/Calculations/useDefaultAnalogValueForFieldWithValuesAccordingGuide'
import ReferenceOptionSelect from '~/components/UI-KIT/Selects/ReferenceOptionSelect.vue'

const props = defineProps({
  analogsViewStartIndex: { type: Number, required: true },
  tabTitle: { type: String, required: true },
  field: { type: String, required: true },
})

const { $calculations }: any = useNuxtApp()

const displayedAnalogs = computed(() =>
  $calculations.selectedAnalogs.slice(props.analogsViewStartIndex, props.analogsViewStartIndex + 3),
)
const aim = computed(() => $calculations.aim)
const analogs = computed(() => $calculations.selectedAnalogs)
const referenceBooksSelected = computed(() => $calculations.referenceBooksSelected)

const getFieldName = (field: string) => {
  return $calculations.getFieldName(field)
}
const getAnalogIndex = (analog: Record<string, any>) => {
  const idsArr = analogs.value.map((analog: Record<string, any>) => analog.id)
  return idsArr.indexOf(analog.id)
}
const getDefaultAimValueForFieldWithValuesAccordingGuide = (field: string | null) => {
  return useDefaultAimValueForFieldWithValuesAccordingGuide(field)
}
const getDefaultAnalogValueForFieldWithValuesAccordingGuide = (analog: Record<string, any>, field: string) => {
  return useDefaultAnalogValueForFieldWithValuesAccordingGuide(analog, field)
}

const emit = defineEmits(['setReferencesModal'])
const setReferencesModal = (field: string) => {
  emit('setReferencesModal', true, field)
}
</script>
