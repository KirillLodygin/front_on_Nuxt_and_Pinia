<template>
  <LoadingCover v-if="!isInit" />
  <AlertEmpty v-if="!$geoObject.objectData.id">Объект не найден!</AlertEmpty>
  <div v-else class="h-100 overflow-y-scroll p-2" @scroll="onScroll" @scrollend="onScrollEnd">
    <div
      v-for="(section, i) in scenarioInfo"
      class="loop-panel mb-3"
      :key="section.title"
      :id="'to-scroll-id_' + section.title"
    >
      <div
        class="card-title mt-2 mb-3"
        :ref="
          (el) => {
            titles[i] = el
          }
        "
        :id="section.title + '_id'"
      >
        {{ section.title }}
      </div>
      <div class="scenario-wrapper row align-items-start">
        <div v-for="pair in section.fields" :key="pair[0] + pair[1]" class="row card-panel-row mb-4">
          <template v-for="(varietyInput, index) in pair" :key="varietyInput">
            <CoordinatesComponent
              v-if="varietyInput === 'coordinates_component'"
              :mutable-data="$geoObject.objectData"
              :disabled-modifier="!$geoObject.isNew || $geoObject.readOnly"
              @update-mutable-data="(field, value) => onUpdateData(field, value)"
            />

            <MapObjectPropertiesInput
              v-else
              :coordinates="$geoObject.objectData.geo_pos.coordinates"
              :data="$geoObject.objectData[varietyInput]"
              :disabled="getDisabled(varietyInput)"
              :field="varietyInput"
              :find-map="mutableOptions[varietyInput]?.flags.findMap"
              :info="mutableOptions[varietyInput]?.flags.info"
              :is-new="false"
              :is-pre-written="false"
              :is-share="varietyInput.includes('share')"
              :object-area="$geoObject.objectData.object_area"
              :object-data="varietyInput === 'floor_number' ? floorProp : mutableOptions[varietyInput]?.objectData"
              :options="varietyInput === 'func_purpose' ? mutableOptions[varietyInput]?.objectData.choices : null"
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
            <template v-if="$geoObject.objectData[pair[0] + '_descr'] || $geoObject.objectData[pair[1] + '_descr']">
              <div
                v-show="
                  !$geoObject.writableFields.includes(varietyInput) && $geoObject.objectData[varietyInput + '_descr']
                "
                :style="{ order: index! + 5 }"
                :class="`col-${pair.length === 1 ? '12' : '6'}`"
                class="inherit-from-text py-2 d-flex align-items-center"
              >
                <template
                  v-if="$geoObject.objectData[varietyInput + '_descr'] && !varietyInput.startsWith('distance_')"
                >
                  <i class="icon fi_inner-link-alt me-2" />
                  {{
                    'Карточка ' +
                    objectTypeCalcToTextDeclined[$geoObject.objectData[varietyInput + '_descr'].object_type_calc]
                  }}
                  <span
                    class="underlined mx-1"
                    @click="
                      navigateToObject(
                        $geoObject.objectData[varietyInput + '_descr'].card_id,
                        $geoObject.objectData[varietyInput + '_descr'].object_type_calc,
                      )
                    "
                    @click.middle="
                      navigateToObject(
                        $geoObject.objectData[varietyInput + '_descr'].card_id,
                        $geoObject.objectData[varietyInput + '_descr'].object_type_calc,
                      )
                    "
                    >#{{ $geoObject.objectData[varietyInput + '_descr'].card_id }}</span
                  >
                  от {{ reformatDate($geoObject.objectData[varietyInput + '_descr'].ads_updated_internal) }}
                </template>
                <template v-else-if="varietyInput.startsWith('distance_')">
                  <i class="icon fi_inner-link-alt me-2" />
                  Источник: <span class="underlined mx-1" style="cursor: auto">гео-данные</span>
                </template>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import MapObjectPropertiesInput from '~/components/MapObjectProperties/Fields/MapObjectPropertiesInput.vue'
import CoordinatesComponent from './Fields/CoordinatesComponent.vue'
import LoadingCover from '../UI-KIT/Loaders/LoadingCover.vue'
import {
  scenario as scenarioObj,
  customObjectData,
  getСustomEmptyObjectData,
  scenarioCreateObject,
  objectTypeCalcToTextDeclined,
} from '~/app_constants/mergedFieldsConst'
import type { objectTypeCalcType } from '~/types/mapObjectPropertiesTypes'
import { calcTypeToPath } from '~/app_constants/routes'
import AlertEmpty from '~/components/UI-KIT/Alerts/AlertEmpty.vue'

interface Props {
  section: string
  tab?: string
}
const props = defineProps<Props>()
const emit = defineEmits(['setSection'])
const { $constData } = useNuxtApp()

const ids = computed(() => {
  return $geoObject.objectData.realty_cards.map((item) => item.id)
})

const mutableOptions: Record<string, any> = reactive({})
const mutableData: Record<string, any> = reactive({})
const objectsData: Record<string, any> = reactive({})
const isInit = ref(false)
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

const { $objectStore, $geoObject } = useNuxtApp()

const scenarioInfo = $geoObject.isNew ? scenarioCreateObject : scenarioObj[$geoObject.objectData.object_type]
const floorProp = computed(() => {
  return $objectStore.floorProp
})

onBeforeMount(async () => {
  console.log('onBeforeMount', props.section, props.tab)
  await init()
  isInit.value = true
})

function onUpdateData(field: string, value: any) {
  console.log(field, value)
  switch (field) {
    case 'address_and_coord':
      $geoObject.objectData.address_raw = value.address
      $geoObject.objectData.geo_pos.coordinates[0] = value.lngLat.lng
      $geoObject.objectData.geo_pos.coordinates[1] = value.lngLat.lat
      $geoObject.objectData.osm_id = value.osm_id
      $geoObject.objectData.geo_obj = value.geo_json
      break
    case 'coord_lng':
    case 'coord_lat':
      const coordinateIndex = field === 'coord_lng' ? 0 : 1
      $geoObject.objectData.geo_pos.coordinates[coordinateIndex] =
        typeof value === 'string' ? +value.replace(',', '.') : value
      break
    default:
      $geoObject.objectData[field] = value
  }
  console.log($geoObject.objectData)
}

function setRealtyCardsInfo() {
  for (const data of $geoObject.objectData.realty_cards) {
    objectsData[data.id] = data
    objectsByType[data.object_type_calc] = []
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
  // console.log(fields)
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
    L: 116,
  }
  const neededMeta = metaByType[$geoObject.objectData.object_type]

  let metaById: Record<string, any> | null = {}
  const options = await $constData.getFieldsOptions()
  let filtredFuncPurposes: any[] = []
  if (!$geoObject.isNew) {
    const funcPurposes = await getFuncPurposes()
    console.log($geoObject.linkedCards[0])
    if ($geoObject.objectData.func_purpose) {
      filtredFuncPurposes = funcPurposes.filter(
        (purpose: any) =>
          purpose.content.type === $geoObject.objectData.func_purpose.type &&
          purpose.content.calc_type === $geoObject.objectData.func_purpose.calc_type &&
          purpose.content.object_type === $geoObject.objectData.func_purpose.object_type,
      )
    } else {
      const calcType = $geoObject.objectData.object_type === 'L' ? 'S' : 'R'
      filtredFuncPurposes = funcPurposes.filter(
        (purpose: any) =>
          purpose.content.type === $geoObject.objectData.object_type &&
          purpose.content.calc_type === calcType &&
          purpose.content.object_type === 'OO',
      )
    }
  }

  if (neededMeta) {
    const data = await $http
      .get(`api/v1/meta/fields/?functional_purpose=${neededMeta}&exchange_type=${'M'}&stage=0`)
      .then((res: Record<string, any>) => res._data)
    const formattedData = data.map((item: any) => {
      // console.log(item, options[item.name])
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
  console.log(metaById, markerForOptions, filtredFuncPurposes)
  for (const field of fields) {
    console.log(markerForOptions[field])
    if (markerForOptions[field] === 0 || customObjectData[field]) {
      mutableOptions[field] = customObjectData[field]
    } else if (markerForOptions[field] === -1) {
      mutableOptions[field] = getСustomEmptyObjectData('test')
    } else if (markerForOptions[field] === 1) {
      if (!serverOptions[field] || field === 'func_purpose') mutableOptions[field] = metaById[field]
      else mutableOptions[field] = { objectData: serverOptions[field], flags: {} }
    }
  }
  setParentImputObjectData()
  console.log(mutableOptions, $geoObject.objectData)
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

function setParentImputObjectData() {
  if ($geoObject.objectData.object_type === 'B') {
    mutableOptions.parent.objectData = {
      choices: Array(0),
      label: 'Расположен на земельном участке',
      type: 'string',
      max_length: 255,
    }
  }
  if ($geoObject.objectData.object_type === 'Q') {
    mutableOptions.parent.objectData = {
      choices: Array(0),
      label: 'Расположен в здании',
      type: 'string',
      max_length: 255,
    }
  }
}

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

function getRequired(field: string) {
  return $geoObject.requiredFields.includes(field)
}
function getDisabled(field: string) {
  return !$geoObject.writableFields.includes(field)
}

function navigateToObject(id: number, object_type_calc: objectTypeCalcType) {
  navigateTo(`/${calcTypeToPath[object_type_calc]}/${id}`, {
    external: true,
    open: {
      target: '_blank',
    },
  })
}

const allSections = scenarioInfo.map((item) => item.title)
const titles: Ref<Element[] | ComponentPublicInstance[] | null[]> = ref([])
const { scrollToSection, onScroll, onScrollEnd } = useMergedSections(titles, () => props.section, allSections, emit)
</script>

<style scoped></style>
