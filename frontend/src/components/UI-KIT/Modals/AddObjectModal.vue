<template>
  <BModal
    v-model="value"
    :cancel-title="'Отмена'"
    :ok-title="'Сохранить'"
    :title="'ДОБАВИТЬ ОБЪЕКТ'"
    :body-class="'px-4 overflow-y'"
    :size="'lg'"
    @hide="resetData"
  >
    <LoadingCover v-if="!isInit" />
    <div v-else class="h-100">
      <div v-for="section in scenarioInfo" class="" :key="section.title" :id="'to-scroll-id_' + section.title">
        <div class="scenario-wrapper align-items-start">
          <div v-for="pair in section.fields" :key="pair[0] + pair[1]" class="row card-panel-row mb-4">
            <template v-for="(varietyInput, index) in pair" :key="varietyInput">
              <CoordinatesComponent
                v-if="varietyInput === 'coordinates_component'"
                :mutable-data="$geoObject.objectData"
                :disabled-modifier="!$geoObject.isNew || $geoObject.readOnly"
                :only-buildings="true"
                @update-mutable-data="(field, value) => onUpdateData(field, value)"
                @building-not-found="
                  () => {
                    duplicateRealtyObject = {}
                    duplicateRealtyObjectArr = []
                    buildingNotFound = true
                    onUpdateData('address_raw', '')
                  }
                "
              />

              <MapObjectPropertiesInput
                v-else
                :coordinates="$geoObject.objectData?.geo_pos?.coordinates"
                :data="$geoObject.objectData[varietyInput]"
                :disabled="getDisabled(varietyInput)"
                :field="varietyInput"
                :find-map="mutableOptions[varietyInput]?.flags.findMap"
                :info="mutableOptions[varietyInput]?.flags.info"
                :is-new="false"
                :is-realty-object="objectType !== 'L'"
                :is-pre-written="false"
                :is-share="varietyInput.includes('share')"
                :object-area="$geoObject.objectData.object_area"
                :object-data="varietyInput === 'floor_number' ? floorProp : mutableOptions[varietyInput].objectData"
                :options="varietyInput === 'func_purpose' ? mutableOptions[varietyInput].objectData.choices : null"
                :required="getRequired(varietyInput)"
                :specify-map="mutableOptions[varietyInput]?.flags.specifyOnMap"
                :unavailable="mutableOptions[varietyInput]?.flags.unavailable"
                :is-cube="mutableOptions[varietyInput]?.flags.isCube"
                :mutable-data="$geoObject.objectData"
                :disabled-modifier="$geoObject.readOnly"
                :index="index + 1"
                :single="pair.length === 1"
                @update-mutable-data="(field, value) => onUpdateData(field, value)"
              ></MapObjectPropertiesInput>
            </template>
          </div>
        </div>
      </div>
      <div v-if="Object.keys(duplicateRealtyObject).length">
        В выбранной Вами точке уже создан объект-недвижимости
        <button class="btn ms-2 btn-outline-secondary" @click="navigateToRealtyObject">Перейти к объекту</button>
      </div>
      <div v-else-if="duplicateRealtyObjectArr.length" class="d-flex flex-column">
        В выбранной Вами точке уже создан объект(ы)-недвижимости типа помещение:
        <div class="mt-1">
          <div v-for="object in duplicateRealtyObjectArr" :key="object.id" class="d-flex pe-1">
            <div class="w-100">
              Объект #{{ object.id }}
              <button class="btn ms-2 btn-outline-secondary" @click="navigateQuarterRealtyObject(object.id)">
                Перейти к объекту
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="buildingNotFound">
        В выбранной Вами точке нет объекта ОСМ типа здание. Если Вы уверены, что он должен быть, то обратитесь к
        администратору.
      </div>
    </div>

    <template #footer="{ ok, cancel }">
      <div>
        <button :class="'btn btn-md btn-outline-secondary'" type="button" @click="cancel()">
          {{ 'Отмена' }}
        </button>
        <button
          :class="'btn btn-md btn-primary ms-2'"
          type="button"
          :disabled="
            isSaving ||
            (!$geoObject.isBaseFieldsReady && $geoObject.isFormChanged) ||
            !$geoObject.isFormChanged ||
            !!Object.keys(duplicateRealtyObject).length
          "
          @click="handleSave(ok)"
        >
          <template v-if="isSaving">
            <div class="spinner-border spinner-button" role="status"></div>
          </template>
          <template v-else>
            {{ 'Сохранить' }}
          </template>
        </button>
      </div>
    </template>
  </BModal>
</template>

<script setup lang="ts">
import { api_realty_objects, api_unversal_realty } from '~/app_constants/api'
import MapObjectPropertiesInput from '~/components/MapObjectProperties/Fields/MapObjectPropertiesInput.vue'
import CoordinatesComponent from '~/components/MapObjectProperties/Fields/CoordinatesComponent.vue'
import LoadingCover from '~/components/UI-KIT/Loaders/LoadingCover.vue'
import {
  scenario as scenarioObj,
  customObjectData,
  getСustomEmptyObjectData,
  scenarioCreateObject,
  objectTypeCalcToTextDeclined,
} from '~/app_constants/realEstateFieldConst'
import { cloneDeep } from 'lodash'
import { computed, ref, reactive, onBeforeMount, watch, defineExpose } from 'vue'
import {
  requiredFieldsCreateObject,
  requiredFieldsEmpty,
  writableFieldsCreateObject,
} from '~/app_constants/mergedFieldsConst'
import { navigateString } from '~/app_constants/objectsTable'

interface Props {
  modelValue: boolean
  objectType: any // Добавляем objectType как пропс
  disableNavigate?: boolean
  defaultValues?: Record<string, any>
}
const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'objectCreated'])
const { $mapStore, $constData, $geoObject, $objectStore, $userStore }: any = useNuxtApp()

const value = computed({
  get: () => {
    return props.modelValue
  },
  set: (value) => {
    emit('update:modelValue', value)
  },
})
const buildingNotFound = ref(false)
const isInit = ref(false)
const isSaving = ref(false) // Добавляем состояние загрузки
const mutableOptions: Record<string, any> = reactive({})
const mutableData: Record<string, any> = reactive({})
const objectsData: Record<string, any> = reactive({})
const objectsByType: Record<string, number[]> = {
  OA: [],
  OO: [],
  NE: [],
}
const inheritNames = {
  OA: 'Карточка предложения',
  OO: 'Карточка оценки',
  NE: 'Карточка НЭИ',
}
const inheritFrom: Record<
  string,
  {
    name: string
    id: number
    date: string
  }
> = reactive({})

const scenarioInfo = reactive(scenarioCreateObject) // Добавляем реактивность
const floorProp = computed(() => {
  return $objectStore.floorProp
})

watch(
  () => props.objectType,
  (newVal: any) => {
    console.log('objectType', newVal)
    $geoObject.objectData.object_type = newVal
    updateScenarioInfo(newVal) // Обновляем scenarioInfo при изменении objectType
  },
)

onBeforeMount(async () => {
  console.log('onBeforeMount', props.modelValue)
  console.log('objectType', props.objectType) // Используем objectType
  if (value.value === true) {
    await init()
    isInit.value = true
  }
})

async function onUpdateData(field: string, value: any) {
  console.log('onUpdateData', field, value)
  switch (field) {
    case 'address_and_coord':
      buildingNotFound.value = false
      $geoObject.objectData.address_raw = value.address
      if ($geoObject.objectData.geo_pos?.coordinates) {
        $geoObject.objectData.geo_pos.coordinates[0] = value.lngLat.lng
        $geoObject.objectData.geo_pos.coordinates[1] = value.lngLat.lat
      }
      $geoObject.objectData.osm_id = props.objectType === 'L' ? 1 : value.osm_id
      $geoObject.objectData.geo_obj = value.geo_json
      duplicateRealtyObject.value = {}
      if (props.objectType !== 'L') {
        await checkIsRealtyObjectAlreadyCreated($geoObject.objectData.osm_id)
      }
      break
    case 'coord_lng':
    case 'coord_lat':
      if ($geoObject.objectData.geo_pos?.coordinates) {
        const coordinateIndex = field === 'coord_lng' ? 0 : 1
        $geoObject.objectData.geo_pos.coordinates[coordinateIndex] =
          typeof value === 'string' ? +value.replace(',', '.') : value
      }
      break
    case 'address_raw':
      $geoObject.objectData[field] = value
      if ($mapStore.saVariants[0]) {
        $geoObject.objectData.osm_id = $mapStore.saVariants[0].osm_id
        console.log('osm_id-map', $mapStore.saVariants[0].osm_id)
      }
    default:
      $geoObject.objectData[field] = value
  }
  console.log($geoObject.objectData)
}
const duplicateRealtyObject: Ref<Record<string, any>> = ref({})
const duplicateRealtyObjectArr: Ref<Record<string, any>[]> = ref([])
async function checkIsRealtyObjectAlreadyCreated(osmID: number) {
  duplicateRealtyObject.value = {}
  duplicateRealtyObjectArr.value = []
  isSaving.value = true
  if ($geoObject.objectData.object_type === 'B') {
    const { _data } = await $http.get(api_realty_objects, {
      params: { osm_id: osmID, object_type: $geoObject.objectData.object_type },
    })
    if (_data.results.length) {
      duplicateRealtyObject.value = _data.results[0]
    }
  } else {
    const { _data } = await $http.get(api_realty_objects, {
      params: { osm_id: osmID, object_type: $geoObject.objectData.object_type },
    })

    duplicateRealtyObjectArr.value = _data.results
  }
  isSaving.value = false
}
function navigateToRealtyObject() {
  if (Object.keys(duplicateRealtyObject.value).length) {
    navigateTo({ path: navigateString.real_estate + duplicateRealtyObject.value.id, hash: '#Стандартные поля' })
  }
}
function navigateQuarterRealtyObject(id: number) {
  navigateTo(
    { path: navigateString.real_estate + id, hash: '#Стандартные поля' },
    {
      external: true,
      open: {
        target: '_blank',
      },
    },
  )
}
function setRealtyCardsInfo() {
  for (const data of $geoObject.objectData.realty_cards) {
    objectsData[data.id] = data
    console.log(data)
    objectsByType[data.object_type_calc].push(data.id)
  }
}

function sortByDate() {
  objectsByType.OO.sort((id1, id2) => {
    const aDate = new Date(objectsData[id1].date_calc).getTime()
    const bDate = new Date(objectsData[id2].date_calc).getTime()
    return aDate - bDate
  })
  objectsByType.OA.sort((id1, id2) => {
    const aDate = new Date(objectsData[id1].deal_date).getTime()
    const bDate = new Date(objectsData[id2].deal_date).getTime()
    return aDate - bDate
  })
  objectsByType.NE.sort((id1, id2) => {
    const aDate = new Date(objectsData[id1].date_calc).getTime()
    const bDate = new Date(objectsData[id2].date_calc).getTime()
    return aDate - bDate
  })
}

async function init() {
  setRealtyCardsInfo()
  sortByDate()
  const fields: string[] = scenarioInfo.map((item) => item.fields).flat(Infinity) as any
  const markerForOptions: Record<string, any> = {}

  for (const field of fields) {
    if ($geoObject.writableFields.includes(field)) {
      markerForOptions[field] = 0
    } else if ($geoObject.isNew) {
      markerForOptions[field] = -1
    } else {
      markerForOptions[field] = 1
    }
  }
  const metaByType: any = {
    Q: 100,
    B: 104,
  }
  const neededMeta = metaByType[$geoObject.objectData.object_type]
  let metaById: Record<string, any> | null = {}
  const options = await $constData.getFieldsOptions()
  let filtredFuncPurposes: any[] = []
  if (!$geoObject.isNew) {
    const funcPurposes = await getFuncPurposes()
    filtredFuncPurposes = funcPurposes.filter(
      (purpose: any) =>
        purpose.content.type === $geoObject.objectData.object_type &&
        purpose.content.calc_type === 'R' &&
        purpose.content.object_type === 'OO',
    )
  }
  if (neededMeta) {
    const data = await $http
      .get(`api/v1/meta/fields/?functional_purpose=${neededMeta}&exchange_type=${'M'}&stage=0`)
      .then((res: Record<string, any>) => res._data)
    const formattedData = data.map((item: any) => {
      const type = item.field_type && item.field_type !== 'None' ? item.field_type : options[item.name]?.type
      return {
        ...item,
        type: item.field_type,
        objectData: {
          label: item.label,
          type: type,
          choices: item.name === 'func_purpose' ? filtredFuncPurposes : item.choices,
        },
      }
    })
    metaById = createMutableOptionsObject(formattedData)
  }
  const serverOptions = await $constData.getRealtyObjectOptions()
  for (const field of fields) {
    if (markerForOptions[field] === 0 || customObjectData[field]) {
      mutableOptions[field] = customObjectData[field]
    } else if (markerForOptions[field] === -1) {
      mutableOptions[field] = getСustomEmptyObjectData('test')
    } else if (markerForOptions[field] === 1) {
      if (!serverOptions[field] || field === 'func_purpose') mutableOptions[field] = metaById[field]
      else mutableOptions[field] = { objectData: serverOptions[field], flags: {} }
    }
  }
  console.log(props.defaultValues)
  if (props.defaultValues && Object.keys(props.defaultValues).length) {
    for (const key in props.defaultValues) {
      $geoObject.objectData[key] = props.defaultValues[key]
    }
  }
  isInit.value = true
}

function createMutableOptionsObject(mutableOptionsArr: Record<string, any>[]) {
  const obj: Record<string, any> = {}
  mutableOptionsArr.forEach((item: any) => {
    obj[item.name] = {
      ...item,
    }
  })
  return obj
}

function updateScenarioInfo(objectType: string) {
  // Обновляем scenarioInfo в зависимости от objectType
  scenarioInfo[0].fields = scenarioCreateObject[0].fields.map((pair) => {
    return pair.map((field) => {
      if (field === 'specific_field') {
        // Изменяем поле в зависимости от objectType
        return `${field}_${objectType}`
      }
      return field
    })
  })
}

watch(
  () => props.modelValue,
  (newVal) => {
    console.log(newVal)
    if (newVal) {
      resetData()
    }
  },
)

function formatDate(date: string) {
  return date
    ? new Date(date).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      })
    : '-'
}

async function getFuncPurposes() {
  return (await $constData.getFuncPurposes()).map(
    (item: { id: any; type: any; name: any; calc_type: any; object_type: any; date: any }) => {
      return {
        content: {
          id: item.id,
          type: item.type,
          name: item.name,
          calc_type: item.calc_type,
          object_type: item.object_type,
          date: item.date,
        },
        display_name: item.name,
        value: item.id,
      }
    },
  )
}

function getDisabled(field: string) {
  return !$geoObject.writableFields.includes(field)
}
function getRequired(field: string) {
  return $geoObject.requiredFields.includes(field)
}

function scrollToSection(section: string) {
  setTimeout(() => {
    document.getElementById('to-scroll-id_' + section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 0)
}

function resetData() {
  isInit.value = false
  Object.keys(mutableOptions).forEach((key) => delete mutableOptions[key])
  Object.keys(mutableData).forEach((key) => delete mutableData[key])
  Object.keys(objectsData).forEach((key) => delete objectsData[key])
  Object.keys(objectsByType).forEach((key) => (objectsByType[key] = []))
  Object.keys(inheritFrom).forEach((key) => delete inheritFrom[key])
  duplicateRealtyObject.value = {}
  duplicateRealtyObjectArr.value = []
  $geoObject.$reset()
  $geoObject.objectData.object_type = props.objectType
  init()
}

async function handleSave(ok: Function) {
  isSaving.value = true
  try {
    await $geoObject.save(props.disableNavigate)
    saveObject()
    resetData()
    ok()
    $userStore.setToast('Объект успешно сохранён!', 'success', 4)
  } catch (error) {
    $userStore.setToast('Ошибка при сохранении объекта!', 'error', 4)
  } finally {
    isSaving.value = false
  }
}

function saveObject() {
  emit('objectCreated', $geoObject.initialObjectData)
}

defineExpose({
  scrollToSection,
})
</script>

<style scoped>
.spinner-button {
  width: 24px;
  height: 24px;
  border-width: 2px;
  vertical-align: middle;
}
</style>
