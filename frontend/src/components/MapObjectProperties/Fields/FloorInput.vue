<template>
  <div class="floor-input gap-3">
    <div
      :class="[
        'alert floor-input-header',
        !(+objectArea > 0) ||
        (!isReady && Object.keys(result).length) ||
        (!isNullCheckReady && Object.keys(result).length)
          ? 'alert-danger'
          : 'alert-secondary',
        { contentOpen: open, borderZero: modal },
      ]"
    >
      <p class="floor-input-header-text">Общая площадь: {{ objectArea }}кв.м</p>
      <p v-if="!(+objectArea > 0)" class="floor-input-header-text">
        <i class="icon icon-danger fi_alert-triangle" /> некорректная площадь
      </p>
      <p v-else-if="!isReady && Object.keys(result).length" class="floor-input-header-text">
        <i class="icon icon-danger fi_alert-triangle" /> не совпадает с суммой площадей по этажам
      </p>
      <p v-else-if="!isNullCheckReady && Object.keys(result).length" class="floor-input-header-text">
        <i class="icon icon-danger fi_alert-triangle" /> невозможно сохранить этажи с площадью 0
      </p>
    </div>

    <div v-if="+objectArea > 0" class="floor-input-body d-flex">
      <div :key="rerender" class="floor-input-results">
        <button class="btn bth-tool w-100" @click="addNewFloor"><i class="icon fi_plus-circle" /> Добавить этаж</button>
        <div v-if="Object.keys(result).length" style="margin-top: 11px">
          <div
            v-for="key in Object.keys(result)"
            :key="key"
            :class="currentForm === key ? 'floor-input-results-row__active' : ''"
            class="floor-input-results-row d-flex gap-2"
            @click="
              () => {
                currentForm = key
                isNew = false
                setValue(result, currentForm)
              }
            "
          >
            <p class="floor-input-results-row-text" style="width: 75px">
              {{
                !key.includes('TR')
                  ? options.filter((item: any) => key === item.value)[0].display_name
                  : result[key].floor + ' этаж'
              }}
            </p>
            <p class="floor-input-results-row-text" style="width: 130px">{{ result[key].area }} кв. м.</p>
            <p class="floor-input-results-row-text floor-input-results-row-text__percentege">
              {{
                objectArea !== 0
                  ? (objectArea ? (result[key].area / +objectArea) * 100 : 0).toFixed(2).toLocaleString() + '%'
                  : '0.00%'
              }}
            </p>
            <button class="btn btn-sm-rounded" @click.stop="deleteByKey(key)"><i class="icon fi_trash" /></button>
          </div>
        </div>
        <div v-if="Object.keys(result).length" class="floor-input-results-sum">
          <div class="floor-input-results-row d-flex gap-2">
            <p class="floor-input-results-row-text" style="width: 75px">Итого</p>
            <p class="floor-input-results-row-text" style="width: 130px">{{ getFullArea() }} кв. м.</p>
            <p class="floor-input-results-row-text floor-input-results-row-text__percentege">
              {{
                objectArea !== 0
                  ? (objectArea ? (getFullArea() / +objectArea) * 100 : 0).toFixed(2).toLocaleString() + '%'
                  : '0.00%'
              }}
            </p>
            <button class="btn btn-sm-rounded invisible"><i class="icon fi_trash" /></button>
          </div>
        </div>
      </div>
      <div v-if="Object.keys(result).length" class="floor-input-inputs justify-content-start">
        <div class="alert d-flex p-0 mb-3">
          <i class="icon icon-xl icon-secondary fi_info flex-shrink-0 me-3" />
          <div>Выберите этаж из списка или, при необходимости, введите номер этажа вручную</div>
        </div>
        <div class="cube-select-options mb-3">
          <div v-for="(option, index) in options" :key="option.value">
            <div
              :class="getClassForOption"
              class="cube-select-option"
              style="min-width: 89px"
              @click="
                () => {
                  swapKeys(option.value)
                }
              "
            >
              {{ !option.value.includes('TR') ? option.display_name : 'Ввести номер' }}
            </div>
          </div>
        </div>
        <div class="mb-3">
          <span class="floor-input-input-label map-object-properties_body_input_label-text">Этаж</span>
          <input
            id="floor_input_floor"
            :key="currentForm.includes('TR') ? 100 : currentFloorOption"
            ref="floorInputFloorRef"
            :defaultValue="currentForm.includes('TR') ? result[currentForm]?.floor : currentFloorOption"
            :disabled="!currentForm.includes('TR')"
            autocomplete="off"
            class="map-object-properties_body_input form-control form-control-lg floor-input-input"
            type="number"
            @input.stop="
              (e: any) => {
                if (isNew) {
                  newFloorNumber = +e.target.value
                } else {
                  if (+e.target.value > 2) {
                    swapTrKeys(+e.target.value)
                  } else {
                    e.preventDefault()
                    e.target.value = result[currentForm].floor.toString()
                  }
                }
              }
            "
          />
        </div>
        <div class="input-wrapper">
          <span class="floor-input-input-label map-object-properties_body_input_label-text">Площадь, кв.м</span>
          <div class="input-group mb-3">
            <input
              id="floor_input"
              ref="floorInputRef"
              :defaultValue="result[currentForm] ? result[currentForm]?.area : ''"
              autocomplete="off"
              type="number"
              class="form-control form-control-lg map-object-properties_body_input"
              aria-describedby="floor_input_percentage"
              @input.stop="
                (e: any) => {
                  if (isNew) {
                    newFloorArea = +e.target.value
                  } else {
                    result[currentForm].area = +e.target.value
                    Object.assign(result, cloneObj(result))
                  }
                }
              "
            />
            <span v-if="!isDeleting" class="input-group-text" id="floor_input_percentage">
              {{
                objectArea !== 0
                  ? (objectArea ? ((isNew ? +newFloorArea : +result[currentForm]?.area) / +objectArea) * 100 : 0)
                      .toFixed(2)
                      .toLocaleString() + '%'
                  : '0.00%'
              }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import _cloneDeep from 'lodash/cloneDeep'

interface Props {
  options: any[]
  defaultProp: { [key: string]: any }
  required: boolean
  disabled: boolean
  field: string
  modal?: boolean
  objectArea: number | string
  keyNumber?: number
}

const props = defineProps<Props>()
const emit = defineEmits(['updateMutableData', 'input', 'close', 'update:modelValue'])
const { $objectStore } = useNuxtApp()

const optionsData: Ref<any[]> = ref([...props.options])
const open: Ref<boolean> = ref(false)
const result: { [key: string]: any } = reactive({})
const countOfTR: Ref<number> = ref(0)
const optionsToDisplay: Ref<any[]> = ref([])
const selected: Ref<string> = ref(
  !Object.keys(props.defaultProp).length ? 'Выберите из списка' : parseResult(props.defaultProp),
)
const toggledInputs: Ref<any[]> = ref([])
const isComplited: Ref<boolean> = ref(!!Object.keys(props.defaultProp).length)
const isReady: Ref<boolean> = ref(false)
const isNullCheckReady: Ref<boolean> = ref(false)
const currentForm: Ref<string> = ref(optionsData.value[0].value)

const newFloorArea: Ref<any> = ref('')
const newFloorNumber: Ref<any> = ref('')
const isNew: Ref<boolean> = ref(!(props.defaultProp && Object.keys(props.defaultProp).length))
const rerender: Ref<number> = ref(0)
const floorInputRef = ref<null | HTMLInputElement>(null)
const floorInputFloorRef = ref<null | HTMLInputElement>(null)

const getClassForOption = (index: number, optionValue: string | string[]) => {
  return computed(() => ({
    first: index === 0,
    last: index === props.options.values.length - 1,
    active: currentForm.value === optionValue || (currentForm.value.includes('TR') && optionValue.includes('TR')),
  }))
}

const objectAreaUpdated = computed(() => {
  return $objectStore.keysByObj.areaData
})
const currentFloorOption = computed(() => {
  const option = optionsData.value.filter((item) => currentForm.value === item.value)[0]
  console.log(option, optionsData.value, currentForm.value)

  return option ? option.display_floor.toString() : ''
})
watch(
  () => objectAreaUpdated.value,
  () => {
    console.log('objectAreaUpdated.value', objectAreaUpdated.value)
    const { sumCheck, nullCheck } = calcIsReady(result)
    isReady.value = sumCheck
    isNullCheckReady.value = nullCheck
    if (!isReady) {
      isComplited.value = false
      selected.value = 'Выберите из списка'
      emit('updateMutableData', 'floor_number', null)
    }
  },
)

watch(
  () => result,
  (newv) => {
    const opt = []

    let TRcumulative = 0
    for (const key in newv) {
      if (key.includes('TR')) {
        TRcumulative = TRcumulative + newv[key].area
      }
    }
    for (const key in newv) {
      opt.push({
        display_name: !key.includes('TR')
          ? props.options.filter((item: any) => item.value === key)[0].display_name
          : '',
        value: newv[key].area,
        key: key,
      })
    }
    optionsToDisplay.value = opt
    const { sumCheck, nullCheck } = calcIsReady(result)
    isReady.value = sumCheck
    isNullCheckReady.value = nullCheck
  },
  { deep: true },
)

function findDuplicates(arr: any[]) {
  return arr.filter((item, index) => arr.indexOf(item) !== index)
}

function calcIsReady(obj: { [key: string]: any }) {
  let sum = 0
  let floorCheck = true
  let checkForNull = true
  const floorsArr = []
  for (const key in obj) {
    sum = sum + obj[key].area
    if (+obj[key].area === 0) {
      checkForNull = false
    }
    if (Object.keys(obj[key]).includes('floor')) {
      if (+obj[key].floor < 3) {
        floorCheck = false
      }
      floorsArr.push(+obj[key].floor)
    }
  }

  return {
    sumCheck:
      +sum.toFixed(4) === +props.objectArea &&
      floorCheck &&
      +props.objectArea !== 0 &&
      !findDuplicates(floorsArr).length,
    nullCheck: checkForNull,
  }
}

function cloneObj(obj: any) {
  return _cloneDeep(obj)
}

function createResult() {
  const obj: any = {}
  let count = 1
  for (const key in result) {
    if (!key.includes('TR')) {
      obj[key] = result[key]
    } else if (key.length < 3 && result[key].area) {
      obj[key] = result[key]
    } else if (result[key].area) {
      obj['TR' + count] = result[key]
      count = count + 1
    }
  }
  selected.value = parseFloorResult(obj)
  console.log(selected.value, result)
  if (props.keyNumber) {
    emit('input', obj)
  } else {
    emit('updateMutableData', 'floor_number', obj, selected.value)
  }
  isComplited.value = true
  open.value = false
}

function parseResult(obj: any) {
  const opt = []
  if (Object.keys(props.defaultProp)) {
    let TRcumulative = 0
    for (const key in props.defaultProp) {
      if (key.includes('TR')) {
        TRcumulative = TRcumulative + obj[key].area
      }
    }
    for (const key in props.defaultProp) {
      if (!key.includes('TR'))
        opt.push({
          display_name: props.options.filter((item: any) => item.value === key)[0].display_name,
          value: props.defaultProp[key].area,
          key: props.options.filter((item: any) => item.value === key)[0].key,
        })
    }
    if (TRcumulative) {
      opt.push({ display_name: '3 и выше', value: TRcumulative })
    }
  }
  const result: any = []
  opt.map((item) =>
    result.push(item.display_name + ' (' + ((item.value / +props.objectArea) * 100).toFixed(2) + '%' + ')'),
  )
  return result.join(', ')
}

function parseFloorResult(obj: any) {
  const opt = []

  let TRcumulative = 0
  for (const key in obj) {
    if (key.includes('TR')) {
      TRcumulative = TRcumulative + obj[key].area
    }
  }
  for (const key in obj) {
    if (!key.includes('TR'))
      opt.push({
        display_name: props.options.filter((item: any) => item.value === key)[0].display_name,
        value: obj[key].area,
      })
  }
  if (TRcumulative) {
    opt.push({ display_name: '3 и выше', value: TRcumulative })
  }

  const result: any[] = []

  opt.map((item) => {
    return result.push(item.display_name + ' (' + ((item.value / +props.objectArea) * 100).toFixed(2) + '%' + ')')
  })

  return result.join(', ')
}

function getInitialResult(obj: any) {
  for (const key in obj) {
    if (key.includes('TR')) {
      result['TR' + (countOfTR.value ? countOfTR.value : '')] = { area: obj[key].area, floor: obj[key].floor }
      countOfTR.value = countOfTR.value + 1
      optionsData.value.push({ value: 'TR' + countOfTR.value, display_name: '3 и выше' })
    } else {
      result[key] = { area: obj[key].area }
    }
  }
  let indexOfLastTR: any
  optionsData.value.forEach((item: any, index: any) => {
    if (item.value.includes('TR') && item.value.length >= 3) indexOfLastTR = index
  })

  toggledInputs.value = Object.keys(result).filter((item, index) => index !== indexOfLastTR)
  Object.assign(result, cloneObj(result))
  currentForm.value = Object.keys(result)[0]
  //   result = cloneObj(result)
  // $forceUpdate()
}

async function setValue(result: any, currentForm: any) {
  await nextTick()
  console.log(floorInputRef.value, currentForm, currentForm)
  if (floorInputRef.value && result[currentForm] !== undefined) {
    floorInputRef.value.value = result[currentForm]?.area || ''
  }

  if (
    typeof currentForm === 'string' &&
    currentForm.includes('TR') &&
    floorInputFloorRef.value &&
    result[currentForm] !== undefined
  ) {
    floorInputFloorRef.value.value = result[currentForm]?.floor || ''
  }
}
if (props.defaultProp) {
  getInitialResult(props.defaultProp)
}
onMounted(() => {
  setValue(result, currentForm.value)
})
function getFullArea() {
  let sum = 0
  for (const key in result) {
    sum = sum + result[key].area
  }
  return sum
}

function addNewFloor() {
  const area = +(+props.objectArea - getFullArea()).toFixed(4)
  if (area <= 0) return
  notCreatedKey()
  if (!isNew) return

  if (currentForm.value.includes('TR')) {
    const availableFloor = getAvailableTrFloor()
    result[currentForm.value + countOfTR.value] = {}

    result[currentForm.value + countOfTR.value].floor = availableFloor
    result[currentForm.value + countOfTR.value].area = area
    currentForm.value = currentForm.value + countOfTR.value
    countOfTR.value++
    // }
  } else {
    result[currentForm.value] = {}
    result[currentForm.value].area = area
  }
  isNew.value = false
  setValue(result, currentForm.value)
}

const isDeleting: Ref<boolean> = ref(false)

function deleteByKey(key: string) {
  isDeleting.value = true
  isNew.value = true

  if (currentForm.value === key) {
    delete result[key]
    currentForm.value = Object.keys(result)[0] || ''
  } else {
    delete result[key]
  }

  isDeleting.value = false
  rerender.value++
}

function notCreatedKey() {
  const sortedOptions = [...optionsData.value].sort((a, b) => a.display_floor - b.display_floor)
  const optionsKeys = sortedOptions.map((item) => item.value)
  let lastAddedIndex = -1

  optionsKeys.forEach((option, index) => {
    if (Object.keys(result).includes(option)) {
      lastAddedIndex = index
    }
  })
  if (lastAddedIndex === optionsKeys.length - 1) {
    currentForm.value = optionsKeys[optionsKeys.length - 1]
  } else {
    currentForm.value = lastAddedIndex !== -1 ? optionsKeys[lastAddedIndex + 1] : optionsKeys[0]
  }
}

function swapKeys(newKey: string) {
  const tempResultByKey = result[currentForm.value]
  if (tempResultByKey?.floor && !result[newKey]?.floor) {
    delete tempResultByKey.floor
  }
  if (newKey === 'TR') {
    const availableFloor = getAvailableTrFloor()
    result[newKey + countOfTR.value] = {}

    result[newKey + countOfTR.value].floor = availableFloor
    result[newKey + countOfTR.value].area = tempResultByKey.area

    delete result[currentForm.value]
    currentForm.value = newKey + countOfTR.value
    countOfTR.value++
  } else {
    result[newKey] = tempResultByKey
    delete result[currentForm.value]
    currentForm.value = newKey
  }
}

function swapTrKeys(newFloor: number) {
  const TRs = Object.keys(result).filter((item) => item.includes('TR'))
  const floors = TRs.map((item) => result[item].floor)
  if (floors.includes(newFloor)) {
    let currentFloorsKey = ''
    for (const key of TRs) {
      if (result[key].floor === newFloor) {
        currentFloorsKey = key
        break
      }
    }
    delete result[currentFloorsKey]
  }
  result[currentForm.value].floor = newFloor

  Object.assign(result, cloneObj(result))
}

function getAvailableTrFloor() {
  const floors = Object.keys(result)
    .filter((item) => item.includes('TR'))
    .map((item) => result[item].floor)
    .sort((a, b) => a - b)
  let availableFloor = floors.length ? floors[floors.length - 1] + 1 : 3
  for (let i = 0; i < floors.length - 1; i++) {
    if (floors[i] + 1 !== floors[i + 1]) {
      availableFloor = floors[i] + 1
      break
    }
  }

  return availableFloor
}

defineExpose({
  isReady,
  isNullCheckReady,
  createResult,
})
</script>

<style scoped></style>
