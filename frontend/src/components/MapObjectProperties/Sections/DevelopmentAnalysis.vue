<template>
  <div class="h-100 overflow-y-scroll overflow-x-hidden">
    <div class="loop-panel mb-3">
      <div class="card-title ms-0 mt-0 mb-3">Общая характеристика окружающей постройки</div>
      <div class="card-container">
        <div class="row row-cols-2 pb-3 development-analysis_bordered">
          <div v-for="field in scenario" :key="field" class="d-flex mb-2">
            <div :id="'checkbox-wrapper_' + field" class="check-block">
              <input
                class="d-none"
                type="checkbox"
                :id="'checkbox_' + field"
                :value="values[field]"
                v-model="values[field]"
                :disabled="$objectStore.readOnly"
                @input="
              (e: any) => {
              if (!$objectStore.readOnly) { // Проверяем перед взаимодействием
              toggle(field, e.target.checked)
              }
              }
              "
              />
              <label
                :class="values[field] ? 'checked' : 'unchecked'"
                @click.stop="
                  () => {
                    if (!$objectStore.readOnly) { // Проверяем перед взаимодействием
                      handleClick('checkbox_' + field)
                    }
                  }
                ">
                {{ props.mutableOptions[field].objectData.label }}
              </label>
            </div>
            <i :id="'checkbox-wrapper_icon' + field" class="development-analysis_icon icon fi_alert-circle ms-2" />
            <div class="custom-tooltip-wrapper">
              <BTooltip
                :no-fade="true"
                :placement="'bottom'"
                :target="'checkbox-wrapper_icon' + field"
                custom-class="custom-tooltip"
                triggers="hover"
              >
                <div class="development-analysis_tooltip">
                  {{ props.mutableOptions[field].flags.description }}
                </div>
              </BTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="loop-panel">
      <div class="card-title ms-0 mb-3">
        {{ props.mutableOptions.object_location.objectData.label }}
      </div>
      <div
        v-for="option in props.mutableOptions.object_location.objectData.choices"
        :key="option.value"
        class="d-flex justify-content-between w-100 mb-3"
      >
        <div class="check-block">
          <input
            class="d-none"
            type="radio"
            :id="'checkbox_' + option.display_name + option.value"
            :value="option.value"
            v-model="location_value"
            :disabled="$objectStore.readOnly"
          />
          <label
            :class="location_value === option.value ? 'checked' : 'unchecked'"
            @click.stop="
              () => {
                if (!$objectStore.readOnly) { // Проверяем перед взаимодействием
                  handleClick('checkbox_' + option.display_name + option.value)
                }
              }
            "
          >
            {{ option.display_name }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import difference from 'lodash/difference'
interface Props {
  mutableData: { [key: string]: any }
  mutableOptions: { [key: string]: any }
  valuesProp: { [key: string]: any }
}
const props = defineProps<Props>()
const emit = defineEmits(['updateMutableData'])
const scenario = [
  'residential_area',
  'malls_area',
  'industrial_area',
  'cultural_historical_area',
  'landmarks_area',
  'major_transport_routes',
]

const values: Ref<{ [key: string]: any }> = ref({})
const location_value: Ref<string | null> = ref(props.mutableData.object_location)
const formulas: { [key: string]: any } = {
  1: 'M',
  '1,3': 'M',
  '1,6': 'M',
  '1,6,3': 'M',
  '3,2': 'M',
  '2,6': 'M',
  3: 'L',
  6: 'L',
  '3,6': 'L',
}
const { $objectStore } = useNuxtApp()

watch(
  () => location_value.value,
  (newVal) => {
    emit('updateMutableData', 'object_location', newVal)
  },
)

onMounted(() => {
  fillInitialCheckboxes()
})

function fillInitialCheckboxes() {
  scenario.forEach((item) => {
    values.value[item] = props.mutableData[item] === 'Y'
  })
}

function toggle(field: string, value: string) {
  if ($objectStore.readOnly) return

  setTimeout(() => {
    const newSum = []
    for (const key in values.value) {
      if (values.value[key]) {
        newSum.push(props.mutableOptions[key].flags.weight)
        emit('updateMutableData', key, 'Y')
      } else {
        emit('updateMutableData', key, 'N')
      }
    }

    const isM = checkNewSumArrForValue(newSum, 'M')
    const isL = checkNewSumArrForValue(newSum, 'L')

    if ((isM && isL) || isM) {
      location_value.value = 'M'
    } else if (isL) {
      location_value.value = 'L'
    } else if (!newSum.length) {
      location_value.value = null
    } else {
      location_value.value = 'H'
    }
  }, 0)
}

function checkNewSumArrForValue(arr: any[], value: string) {
  let finded = false
  for (const key in formulas) {
    if (
      !difference(
        key.split(',').map((item) => +item),
        arr,
      ).length &&
      formulas[key] === value
    ) {
      finded = true
    }
  }
  return finded
}
const handleClick = (valueArg: string) => {
  const input = document.getElementById(valueArg)
  input?.click()
}
</script>
