<template>
  <div v-if="!isLayersLoading" class="h-100 overflow-y-scroll d-flex">
    <div class="h-100 research-filters">
      <h6 class="sort-header sort-header__sliders pb-2 m-0 research-filters-header research-bordered-bottom">
        Параметры отчёта
      </h6>
      <div class="research-filters-body">
        <div
          v-for="group in researchScenario"
          :key="group.title"
          class="tab_environment_group research-bordered-bottom pb-2 pt-2 ps-1"
        >
          <label class="research-group-header">{{ group.title }}</label>
          <div v-if="group.searchable" class="research-group-searchbar-wrapper position-relative mb-2">
            <input
              v-model="searchFields[group.group].value"
              class="form-control research-group-searchbar"
              placeholder="Фильтр по параметру..."
              @input="
                () => {
                  search(group.group)
                }
              "
            />
            <i class="background-icon research-group-searchbar-icon icon fi_search icon-gray icon-medium" />
          </div>

          <div v-for="field in group.fields" :key="field">
            <ResearchField
              v-if="fieldsData[field].type === 'none'"
              v-model="layersNameChecked"
              :count-by-checked-layers="countByCheckedLayers"
              :display-counts="!!objects.length"
              :expandable="true"
              :expanded="expanded[fieldsData[field].field]"
              :field="fieldsData[field].field"
              :is-layer="true"
              :label="fieldsData[field].label"
              :options="layersName"
              :searchable="false"
              :type="fieldsData[field].type"
              :intermediate-state="!!intermediateState[fieldsData[field].field]"
              @checkAll="
                (layer) => {
                  intermediateState[fieldsData[field].field] = false
                  checkAllSublayersByLayer(layer)
                }
              "
              @expanded="expanded[fieldsData[field].field] = !expanded[fieldsData[field].field]"
              @uncheckAll="
                (layer) => {
                  intermediateState[fieldsData[field].field] = false
                  unCheckAllSublayersByLayer(layer)
                }
              "
              @update:model-value="
                (value) => {
                  filterObjects()
                }
              "
            />
            <ResearchField
              v-else
              v-model="radius"
              :expandable="true"
              :expanded="true"
              :field="fieldsData[field].field"
              :label="fieldsData[field].label"
              :options="fieldsData[field].choices"
              :searchable="false"
              :type="fieldsData[field].type"
            />

            <div v-if="fieldsData[field].type === 'none' && expanded[fieldsData[field].field]">
              <div>
                <ResearchField
                  v-model="sublayersNameChecked[fieldsData[field].field]"
                  :count-by-checked-sublayers="countByCheckedSublayers"
                  :display-counts="!!objects.length"
                  :expandable="false"
                  :expanded="false"
                  :is-sublayer="true"
                  :options="sublayersName[fieldsData[field].field]"
                  :search-str="searchFields[group.group].value"
                  :searchable="true"
                  :type="'none'"
                  @update:model-value="
                    (value) => {
                      filterObjects()
                      checkIsAllSubLayersChecked(fieldsData[field].field)
                    }
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-block-wrapp text-center">
        <ButtonWithLoader
          buttonClass="mb-2 p-0"
          height="32px"
          value="Применить"
          variant="outline-primary"
          width="80%"
          :disabled="!readyToFetch"
          :is-loading="isObjectsLoading"
          @click="
            async () => {
              await getObjects()
              await setMarker()
            }
          "
        />
        <ButtonWithLoader
          buttonClass="mb-2 p-0"
          height="32px"
          value="Сбросить"
          variant="outline-secondary"
          width="80%"
          @click="reset"
        />
      </div>
    </div>
    <div class="h-100 flex-fill p-1 overflow-y-hidden">
      <div class="table-toolbar mb-3">
        <button class="btn bth-tool me-2" @click="downloadScreenshot()">
          <i class="icon research-download-icon me-1 fi_download" />Скачать снимок карты
        </button>
        <button
          class="btn bth-tool me-2"
          :disabled="isReportIsFetching"
          @click="
            downloadReport(
              $baseURL + api_report + `?id=${props.mutableData.pk}`,
              `Окружение объекта ${props.mutableData.pk}`,
            )
          "
        >
          <i class="icon research-download-icon me-1 fi_download" />
          Скачать отчёт
          <BSpinner v-if="isReportIsFetching" variant="primary" :small="true" class="ms-1" />
        </button>
        <div v-if="showReportAlert && isReportIsFetching" class="tab_files_header_menu gap-2">
          <i class="icon fi_alert-circle" />
          Не закрывайте страницу пока готовится отчёт. Это может занять до 2-х минут
          <i class="icon fi_x" type="button" @click="showReportAlert = false" />
        </div>
      </div>
      <div class="h-100 overflow-y-scroll">
        <div class="research-map-wrapper h-100 pe-4">
          <MapComponent
            ref="vMap"
            v-slot="{ map, mapInit }"
            :address-from-map="false"
            :express="false"
            :is-analog-map-modal="false"
            :layers-tree="{}"
            :showCtxMenu="false"
            class="h-100"
            @map-loaded="
              async () => {
                await setMarker()
              }
            "
          >
            <ObjectsLayer :mode="'researchTab'" :items="filtredObjects" :map="map" :mapInit="mapInit"></ObjectsLayer>
          </MapComponent>
        </div>
        <div v-if="Object.keys(reportCalcTable).length" class="pe-4">
          <div v-for="table in Object.keys(reportCalcTable)" :key="table" class="mt-3 mb-0 border-dark">
            <table
              class="table m-0 text-center geo-layer-table-content files-table table b-table table-bordered research-table w-100"
            >
              <thead>
                <tr>
                  <th class="text-start" rowspan="2" scope="col">Функциональное назначение</th>
                  <th colspan="2" scope="col">
                    {{ table === 'radius_table' ? 'Продажа' : 'Диапазон цен продажи, руб. за кв.м.' }}
                  </th>
                  <th colspan="2" scope="col">
                    {{ table === 'radius_table' ? 'Аренда' : 'Диапазон цен аренды, руб. за кв.м.' }}
                  </th>
                </tr>
                <tr>
                  <th scope="col">{{ table === 'radius_table' ? 'Радиус' : 'Мин. цена' }}</th>
                  <th scope="col">{{ table === 'radius_table' ? 'Количество' : 'Макс. цена' }}</th>
                  <th scope="col">{{ table === 'radius_table' ? 'Радиус' : 'Мин. цена' }}</th>
                  <th scope="col">{{ table === 'radius_table' ? 'Количество' : 'Макс. цена' }}</th>
                </tr>
              </thead>
              <tbody class="table-group-divider">
                <tr v-for="fp in Object.keys(reportCalcTable[table])" :key="fp">
                  <td class="text-start research-bordered-bottom" scope="row">{{ fp }}</td>
                  <td>
                    {{
                      table === 'price_table'
                        ? reportCalcTable[table][fp].sale.min
                        : reportCalcTable[table][fp].sale.radius
                    }}
                  </td>
                  <td>
                    {{
                      table === 'price_table'
                        ? reportCalcTable[table][fp].sale.max
                        : reportCalcTable[table][fp].sale.count
                    }}
                  </td>
                  <td>
                    {{
                      table === 'price_table'
                        ? reportCalcTable[table][fp].rent.min
                        : reportCalcTable[table][fp].rent.radius
                    }}
                  </td>
                  <td>
                    {{
                      table === 'price_table'
                        ? reportCalcTable[table][fp].rent.max
                        : reportCalcTable[table][fp].rent.count
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="d-flex align-items-center justify-content-center h-60">
          <BSpinner class="mx-auto mt-10"></BSpinner>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="d-flex align-items-center justify-content-center h-100">
    <BSpinner class="mx-auto mt-10"></BSpinner>
  </div>
  <ModalMessage v-model="isOpenPZZ" size="lg" title="ВНИМАНИЕ!">
    <template #default>
      Не загружены необходимые файлы. Вы можете нажать кнопку "Отмена" и добавить необходимые файлы в разделе "Работа с
      файлами" или нажать кнопку "Скачать отчёт" чтобы сформировать отчёт, игнорируя недостающие файлы
    </template>
    <template #footer="{ ok, cancel }">
      <button class="btn btn-outline-secondary" @click="cancel">Отмена</button>
      <button
        class="btn btn-primary"
        @click="
          () => {
            axiosDownloadFile(
              $baseURL + api_report + `?id=${props.mutableData.pk}`,
              `Окружение объекта ${props.mutableData.pk}`,
            )
            ok()
          }
        "
      >
        Скачать отчет
      </button>
    </template>
  </ModalMessage>

  <ModalMessage v-model="isOpenSpecify" title="ПРЕДУПРЕЖДЕНИЕ">
    <template #default>
      {{ errorStr }}
    </template>
    <template #footer="{ ok, cancel }">
      <button class="btn btn-outline-secondary" @click="cancel">Уточнить характеристики</button>
      <button
        class="btn btn-primary"
        @click="
          () => {
            axiosDownloadFile(
              $baseURL + api_report + `?id=${props.mutableData.pk}`,
              `Окружение объекта ${props.mutableData.pk}`,
              true,
            )
            ok()
          }
        "
      >
        Скачать отчет
      </button>
    </template>
  </ModalMessage>
</template>

<script lang="ts" setup>
import _isEmpty from 'lodash/isEmpty'
import html2canvas from 'html2canvas'
// @ts-ignore
import * as turf from '@turf/turf'
import { researchFields, researchScenario } from '~/app_constants/researchTabScenario'
import ObjectsLayer from '../../MapComponent/ObjectsLayer.vue'
import ResearchField from '../ResearchField.vue'
import ButtonWithLoader from '../../UI-KIT/Buttons/BaseFormButton.vue'
import ModalMessage from '~/components/UI-KIT/Alerts/ModalMessage.vue'
import { filesGroupCard } from '~/app_constants/filesGroup'

import { api_constant, api_geo_objects_in_radius, api_osm_layer_id, api_report } from '~/app_constants/api'
import maplibre, { type LngLat } from 'maplibre-gl'
import { type FileType } from '~/types/mapObjectPropertiesTypes'

interface Props {
  geoPos: {
    [key: string]: any
  }
  mutableData: {
    [key: string]: any
  }
}

const props = defineProps<Props>()
const { $objectStore, $baseURL, $userStore, $mapStore } = useNuxtApp()
const isLayersLoading = ref(true)
const radius: Ref<any> = ref(500)
const showReportAlert = ref(true)
onBeforeMount(async () => {
  isLayersLoading.value = true
  await loadLayers()
  fillToggledObject()
  fillSearchFields()
  if (props.mutableData.pk) {
    getReportCalcTable()
  }

  isLayersLoading.value = false
})

// Карта

const vMap = ref<HTMLElement | null>(null)

async function setMarker() {
  console.log('setMArker')

  const steps = 64
  //@ts-ignore
  vMap.value.setMarker({ lat: props.geoPos.coordinates[1], lng: props.geoPos.coordinates[0] })

  const _bounds = maplibre.LngLatBounds.fromLngLat(
    { lat: props.geoPos.coordinates[1], lng: props.geoPos.coordinates[0] } as LngLat,
    radius.value,
  ).toArray()

  //   _bounds.extend({ lon: props.geoPos.coordinates[0], lat: props.geoPos.coordinates[1] })
  //   @ts-ignore
  vMap.value.map.fitBounds(_bounds, { padding: 50, linear: true, maxZoom: 17 })

  const circle = turf.circle(props.geoPos.coordinates, radius.value / 1000, { steps })
  //@ts-ignore
  console.log(vMap.value.map, vMap.value.map.getLayer('location-radius'), vMap.value.map.getSource('location-radius'))
  //@ts-ignore
  if (vMap.value.map.getLayer('location-radius')) vMap.value.map.removeLayer('location-radius')
  //@ts-ignore
  if (vMap.value.map.getSource('location-radius')) vMap.value.map.removeSource('location-radius')
  //@ts-ignore
  if (vMap.value.map.getLayer('location-radius-outline')) vMap.value.map.removeLayer('location-radius-outline')
  //@ts-ignore
  if (vMap.value.map.getSource('location-radius-outline')) vMap.value.map.removeSource('location-radius-outline')

  // Add a fill layer with some transparency.
  //@ts-ignore
  vMap.value.map.addLayer({
    id: 'location-radius',
    type: 'fill',
    source: {
      type: 'geojson',
      data: circle,
    },
    paint: {
      'fill-color': '#8CCFFF',
      'fill-opacity': 0.3,
    },
  })

  // Add a line layer to draw the circle outline

  //@ts-ignore
  vMap.value.map.addLayer({
    id: 'location-radius-outline',
    type: 'line',
    source: {
      type: 'geojson',
      data: circle,
    },
    paint: {
      'line-color': '#0094ff',
      'line-width': 3,
    },
  })
  //@ts-ignore
  const lastLayer = vMap.value.map.getLayersOrder()[1]
  //@ts-ignore
  vMap.value.map.moveLayer('location-radius', lastLayer)
  //@ts-ignore
  vMap.value.map.moveLayer('location-radius-outline', 'location-radius')
}

function log(value: any) {
  console.log('LOG', value)
}

// Работа со слоем OSM

async function loadLayers() {
  const treeData = await getLayerTree()
  loadLayersTree(treeData)
}

async function getLayerTree() {
  const data = await $http.get('api/v1/layers/geo_layer_tree/').catch((err: any) => console.log(err))

  return data!._data
}

function loadLayersTree(loadingTreeData: any) {
  let prevTreeData: any = loadingTreeData
  // if (layersTreeData) {
  //   prevTreeData = layersTreeData
  // }
  let treeData = loadingTreeData
  treeData.push({
    data: {
      id: 'searchOSM',
      name: 'searchOSM',
      descr: null,
      color: '#0000FF',
      style: {
        fill_color: '#0000FF',
        fill_opacity: 0,
        fill_pattern: 0,
        line_color: '#000000',
        line_width: 2,
        line_dasharray: 0,
        text_color: '#000000',
        text_size: 10,
        text_field: '',
        glyph_name: null,
      },
      caption: null,
      file_name: null,
      layer_type: 'G',
      glyph_name: null,
      tn_parent: null,
    },
    children: [],
  })

  let layersTreeData = treeData

  let layerOSM =
    getTreeItemForName(layersTreeData, 'objectsOSM') && getTreeItemForName(layersTreeData, 'objectsOSM').data
  if (_isEmpty(layerOSM)) {
    layerOSM = { id: 0 }
  }

  const realtyFields: any = {}
  let layerOSMTypes = []
  if (layerOSM?.id !== 0 && layerOSM?.style.osmlayers) {
    realtyFields.layers = {
      label: 'Слои OSM',
      read_only: false,
      required: false,
      type: 'choice',
      base: false,
      search: true,
      all: false,
    }
    // realtyFields.layers.OSM = true
    realtyFields.layers.choices = {}

    realtyFields.sublayers = {
      label: 'Подслои OSM',
      read_only: false,
      required: false,
      type: 'choice',
      base: false,
      search: true,
      all: false,
    }
    realtyFields.sublayers.choices = {}

    layerOSM.style.osmlayers.forEach((layer: any) => {
      realtyFields.layers.choices[layer.name] = {
        display_name: layer.title,
        value: layer.name,
        color: layer.color,
        checked: false,
        sublayers: {},
      }

      layersName.value.push({ display_name: layer.title, value: layer.name })

      sublayersName.value[layer.name] = []
      sublayersNameChecked.value[layer.name] = []
      expanded.value[layer.name] = false

      layer.sublayers.forEach((sublayer: any) => {
        realtyFields.layers.choices[layer.name].sublayers[sublayer.name] = {
          display_name: sublayer.title,
          value: sublayer.name,
          layer_type: layer.name,
          color: sublayer.color,
          checked: false,
        }

        sublayersName.value[layer.name].push({
          value: sublayer.name,
          display_name: sublayer.title,
          color: sublayer.color,
        })
      })
    })
    layerOSMTypes = realtyFields.layers.choices
  }
  layersOSM.value = realtyFields
  console.log(layerOSMTypes, realtyFields)
}

function treeTraversal(tree: any, callback: any) {
  var memory: any[] = []

  // в начале память содержит ссылки на корневые элементы
  tree.forEach((item: any) => memory.push(item))
  let curItem // текущий элемент

  // закончить цикл, если не получается извлечь элемент из памяти
  while (memory.length) {
    curItem = memory.pop()
    if (callback(curItem)) {
      return curItem
    }
    if (curItem.children) {
      // помещаем дочерние элементы в память
      for (let i = 0; i < curItem.children.length; i++) {
        memory.push(curItem.children[i])
      }
    }
  }
  return null
}

// Функция обхода дерева, аналогичная treeTraversal,
// с передачей доп. атрибутов в callback(item, level, parent), где:
// level - уровень элемента в дереве (верхний - 0)
// parent - предок элемента
function treeTraversalExt(tree: any, callback: any) {
  var memory: any[] = []
  // в начале память содержит ссылки на корневые элементы
  tree.forEach((_item: any) => memory.push({ item: _item, level: 0, parent: null }))
  let curItem // текущий элемент

  // закончить цикл, если не получается извлечь элемент из памяти
  while (memory.length) {
    curItem = memory.pop()
    if (callback(curItem.item, curItem.level, curItem.parent)) {
      return curItem.item
    }
    if (curItem.item.children) {
      // помещаем дочерние элементы в память
      for (let i = 0; i < curItem.item.children.length; i++) {
        memory.push({ item: curItem.item.children[i], level: curItem.level + 1, parent: curItem.item })
      }
    }
  }
  return null
}

// Функция обхода предков элементов дерева, где в элементе хранится Id предка в поле parentId
function parentsTraversal(_tree: any, item: any, callback: any) {
  let _parentId = item.parentId

  while (_parentId > 0) {
    const _parent = getTreeItem(_tree, _parentId)
    if (callback(_parent)) {
      return _parent
    }
    _parentId = _parent.parentId
  }
  return null
}

// Возвращает элемент дерева по id
function getTreeItem(_tree: any, id: any) {
  return treeTraversal(_tree, (item: any) => {
    return item.data.id === id
  })
}

// Возвращает элемент дерева по name
function getTreeItemForName(_tree: any, name: any) {
  return treeTraversal(_tree, (item: any) => {
    return item.data.name === name
  })
}

// Работа с отмеченными данными

const layersOSM: Ref<{ [key: string]: any }> = ref({})

const fieldsData: { [key: string]: any } = reactive({})

function fillToggledObject() {
  researchFields.forEach((item: any) => {
    fieldsData[item.field] = { ...item, isToggled: false, value: item.field === 'radius' ? 500 : null }
  })
}

const searchFields: { [key: string]: any } = reactive({})

function fillSearchFields() {
  researchScenario.forEach((item: any) => {
    if (item.searchable) {
      searchFields[item.group] = {
        value: '',
        containedLayers: item.fields,
      }
    }
  })
}

const layersName: Ref<{ value: any; display_name: any }[]> = ref([])
const layersNameChecked: Ref<string[]> = ref([])
const sublayersName: Ref<{ [key: string]: { value: any; display_name: any; color: any }[] }> = ref({})
const sublayersNameChecked: Ref<{ [key: string]: string[] }> = ref({})
const checkboxIsChanging: Ref<boolean> = ref(false)

function checkAllSublayersByLayer(layer: string) {
  // console.log(layer)

  for (const key of sublayersName.value[layer]) {
    console.log(key)
    if (!sublayersNameChecked.value[layer].includes(key.value)) {
      sublayersNameChecked.value[layer].push(key.value)
    }
  }
}

function unCheckAllSublayersByLayer(layer: string) {
  sublayersNameChecked.value[layer] = []
}

const objects: Ref<any[]> = ref([])
const filtredObjects: Ref<any[]> = ref([])
const isObjectsLoading: Ref<boolean> = ref(false)

async function getObjects() {
  isObjectsLoading.value = true

  try {
    // const layerIDResponse = await $http.get(api_constant + api_osm_layer_id)
    // const layerID = layerIDResponse._data[0].value
    const layerID = await $mapStore.getOsmLayerId()
    console.log('Layer ID:', layerID)

    // Функция для выполнения запроса к API
    async function fetchObjects(page = 1) {
      return await $http.get(api_geo_objects_in_radius, {
        params: {
          geo_layer__in: layerID,
          lat: props.geoPos.coordinates[1],
          lon: props.geoPos.coordinates[0],
          distance: radius.value,
          limit: 10000,
          page,
        },
      })
    }

    // Получаем данные первой страницы
    let objectsData = await fetchObjects()
    const res = objectsData._data
    let results = res.results

    // Получаем данные остальных страниц
    const totalPages = res.total_pages
    for (let i = 2; i <= totalPages; i++) {
      objectsData = await fetchObjects(i)
      results.push(...objectsData._data.results)
    }

    objects.value = results
    filterObjects()
    console.log('Filtered Objects:', filtredObjects.value)
  } catch (err) {
    console.error('Error fetching objects:', err)
  } finally {
    isObjectsLoading.value = false
    radiusChanged.value.prev = radius.value
  }
}

function filterObjects() {
  filtredObjects.value = objects.value
    .filter(({ obj_misc }: { obj_misc: { objsubtype: string } }) =>
      checkedSubLayers.value.includes(obj_misc.objsubtype),
    )
    .map(({ obj_misc, ...rest }: { obj_misc: { objsubtype: string; objtype: string }; [key: string]: any }) => {
      const { color, display_name } = layersOSM.value.layers.choices[obj_misc.objtype].sublayers[obj_misc.objsubtype]

      return {
        ...rest,
        subtype_name: display_name,
        obj_misc,
        color,
      }
    })
}

const radiusChanged: Ref<{ current: any; prev: any }> = ref({ current: radius.value, prev: 0 })

const readyToFetch = computed(() => {
  return radiusChanged.value.current !== radiusChanged.value.prev
})
watch(
  () => radius.value,
  (newVal) => {
    radiusChanged.value.current = newVal
  },
)

const checkedSubLayers = computed(() => {
  const layers = []
  for (const key in sublayersNameChecked.value) {
    layers.push(...sublayersNameChecked.value[key])
  }
  return layers
})

const countByCheckedLayers = computed(() => {
  const res: { [key: string]: any } = {}
  for (const layer of layersName.value) {
    res[layer.value] = objects.value.filter((item) => item.obj_misc.objtype === layer.value).length
  }
  console.log(res, 'countByCheckedLayers')
  return res
})
const countByCheckedSublayers = computed(() => {
  const res: { [key: string]: any } = {}
  for (const layer of layersName.value) {
    for (const sublayer of sublayersName.value[layer.value])
      res[sublayer.value] = objects.value.filter((item) => item.obj_misc.objsubtype === sublayer.value).length
  }
  console.log(res, 'countByCheckedSublayers')
  return res
})

function downloadScreenshot() {
  // @ts-ignore
  html2canvas(vMap.value!.map.getCanvas()).then((canvas) => {
    var link = document.createElement('a')

    link.download = 'myMapScreenshot.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  })
}

function reset() {
  for (const layer of layersName.value) {
    sublayersNameChecked.value[layer.value] = []

    expanded.value[layer.value] = false
  }
  for (const group of researchScenario) {
    // console.log(searchFields[group.group], group, searchFields)
    if (group.searchable) {
      searchFields[group.group].value = ''
    }
  }
  layersNameChecked.value = []
  radius.value = 500
  radiusChanged.value = {
    current: 500,
    prev: 0,
  }
  objects.value = []
  filtredObjects.value = []
}

// ОТображение фильтров
// const searchFields: Ref<{ [key: string]: any }> = ref({})
const expanded: Ref<{ [key: string]: any }> = ref({})

function search(group: string) {
  for (const layer of searchFields[group].containedLayers) {
    expanded.value[layer] = !!sublayersName.value[layer].filter((item) =>
      item.display_name.toLocaleLowerCase().includes(searchFields[group].value.toLocaleLowerCase()),
    ).length
    // for (const sublayer in sublayersName.value[layer]){
    //   expanded.value[layer] = sublayersName.value[layer][sublayer].
    // }
  }
}

// Проверка на файлы
const isOpenPZZ = ref(false)
const isOpenSpecify = ref(false)
const isReportIsFetching = ref(false)
const errorStr = ref('')

function downloadReport(url: string, fileName: string) {
  let fileAbsence = false
  const files = props.mutableData.files as FileType[]
  const filesDescriptions = files.map((item) => item.description)
  console.log(filesGroupCard[$objectStore.objectTypeCalc][$objectStore.objectType])
  filesGroupCard[$objectStore.objectTypeCalc][$objectStore.objectType].forEach((item) => {
    if (!filesDescriptions.includes(item)) fileAbsence = true
  })
  console.log(fileAbsence)
  if (fileAbsence) {
    isOpenPZZ.value = true
  }
}

function axiosDownloadFile(url: string, fileName: string, ignore_pzz = false) {
  isReportIsFetching.value = true
  // console.log(url)
  return $http
    .get({
      url,
      params: {
        ignore_pzz,
      },
    })
    .then((response: Record<string, any>) => {
      const href = window.URL.createObjectURL(response._data)

      const anchorElement = document.createElement('a')

      anchorElement.href = href
      anchorElement.download = fileName

      document.body.appendChild(anchorElement)
      anchorElement.click()

      document.body.removeChild(anchorElement)
      window.URL.revokeObjectURL(href)
      isReportIsFetching.value = false
    })
    .catch((error: any) => {
      if (error instanceof Error) {
        const responseError = error as { response?: Record<string, any> }
        if (responseError.response) {
          console.log(responseError.response)
          if (responseError.response?.status === 500) {
            isOpenSpecify.value = false
            $userStore.setErrorModal(true)
          } else {
            console.log(responseError, responseError.response)
            errorStr.value = responseError.response._data.Error
            isOpenSpecify.value = true
          }
        } else $userStore.setErrorModal(true)
      } else $userStore.setErrorModal(true)
      isReportIsFetching.value = false
    })
}

// Кракий отчет
const reportCalcTable: Ref<{ [key: string]: any }> = ref({})

function getReportCalcTable() {
  $http.get('api/v1/report/calc/', { params: { id: props.mutableData.pk } }).then((res: Record<string, any>) => {
    reportCalcTable.value = res._data
    console.log(reportCalcTable.value)
  })
}

const intermediateState: Ref<Record<string, any>> = ref({})
function checkIsAllSubLayersChecked(layer: string) {
  console.log(layer, sublayersNameChecked.value[layer], Object.keys(layersOSM.value.layers.choices[layer].sublayers))
  if (
    sublayersNameChecked.value[layer].length === Object.keys(layersOSM.value.layers.choices[layer].sublayers).length
  ) {
    if (!layersNameChecked.value.includes(layer)) {
      layersNameChecked.value.push(layer)
      intermediateState.value[layer] = false
    }
  } else {
    if (!sublayersNameChecked.value[layer].length) {
      layersNameChecked.value = layersNameChecked.value.filter((item) => item !== layer)
      intermediateState.value[layer] = false
    } else {
      layersNameChecked.value = layersNameChecked.value.filter((item) => item !== layer)
      intermediateState.value[layer] = true
    }
  }
}
</script>

<style scoped></style>
