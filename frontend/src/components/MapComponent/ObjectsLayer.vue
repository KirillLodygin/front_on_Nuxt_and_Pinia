<!--
  Отображает на карте слой с объектами ОА, ОО, НЭИ из массива, который заранее был загружен с сервера
  Используется внутри тэга MapComponent
-->
<template>
  <template
    v-if="currentAnalogPopupID && objectsInCluster.length"
    :key="currentAnalogPopupID + objectsInCluster.length"
  >
    <Teleport :to="'#' + currentAnalogPopupID">
      <div class="wrap d-flex align-items-center objects-in-cluster-scrollbar">
        <i
          class="icon fi_chevron-left align-self-center"
          :class="{ 'objects-in-cluster-scrollbar__disabled': currentObjectInCluster - 1 < 0 }"
          @click="setCurrentObjectInCluster(currentObjectInCluster - 1)"
        />
        <div
          id="objects-in-cluster-scrollbar"
          class="overflow-x-scroll overflow-y-hidden functional-buttons-scroll d-flex align-items-center h-100 p-0"
        >
          <div
            v-for="(obj, index) in objectsInCluster"
            :key="index"
            class="objects-in-cluster-item"
            :class="{ 'objects-in-cluster-item__active': +index === currentObjectInCluster }"
            @click="setCurrentObjectInCluster(+index)"
          >
            {{ obj.properties.index + 1 }}
          </div>
        </div>
        <i
          class="icon fi_chevron-right align-self-center"
          :class="{
            'objects-in-cluster-scrollbar__disabled': currentObjectInCluster + 1 > objectsInCluster.length - 1,
          }"
          @click="setCurrentObjectInCluster(currentObjectInCluster + 1)"
        />
      </div>

      <div id="setter" class="custom-annalog-popup d-flex" style="height: 186px">
        <template v-if="mode === 'addObjectsToCompare' || mode === 'displayCompareObjects'">
          <CompareObjectPopup
            :current-compare-object="objectsInCluster[currentObjectInCluster].object"
            :to-display-delete="mode === 'addObjectsToCompare' && isOpenCurrentCompareVal"
          />
        </template>
        <template v-else-if="objectsInCluster[currentObjectInCluster].object.realty_cards">
          <RealtyObjectPopup
            :current-analog-popup-object="objectsInCluster[currentObjectInCluster].object"
            :image-css-prop="imageCssProp"
            :to-show-loader="true"
          />
        </template>
        <template v-else>
          <RealEstateObjectPopup
            :current-analog-popup-object="objectsInCluster[currentObjectInCluster].object"
            :image-css-prop="imageCssProp"
            :to-show-loader="true"
            :mode="mode!"
            @set-analog="setAnalog"
          />
        </template>
      </div>
    </Teleport>
  </template>
  <template v-else-if="currentAnalogPopupID" :key="currentAnalogPopupID">
    <Teleport :to="'#' + currentAnalogPopupID">
      <template v-if="mode === 'addObjectsToCompare' || mode === 'displayCompareObjects'">
        <CompareObjectPopup
          :current-compare-object="currentAnalogPopupObject"
          :to-display-delete="mode === 'addObjectsToCompare' && isOpenCurrentCompareVal"
        />
      </template>
      <template v-else-if="mode === 'onlyRealtyObjectsNoFunctionality'">
        <RealtyObjectPopup
          :current-analog-popup-object="currentAnalogPopupObject"
          :image-css-prop="imageCssProp"
          :to-show-loader="!!imageUrl"
        />
      </template>
      <template v-else-if="mode === 'mixedRealEstateAndRealtyObjects'">
        <template v-if="currentAnalogPopupObject.realty_cards">
          <RealtyObjectPopup
            :current-analog-popup-object="currentAnalogPopupObject"
            :image-css-prop="imageCssProp"
            :to-show-loader="!!imageUrl"
          />
        </template>
        <template v-else-if="currentAnalogPopupObject.object_type_calc">
          <RealEstateObjectPopup
            :current-analog-popup-object="currentAnalogPopupObject"
            :image-css-prop="imageCssProp"
            :to-show-loader="!!imageUrl"
            :mode="mode!"
          />
        </template>
      </template>
      <template v-else-if="currentAnalogPopupObject.object_type_calc">
        <RealEstateObjectPopup
          :current-analog-popup-object="currentAnalogPopupObject"
          :image-css-prop="imageCssProp"
          :to-show-loader="!!imageUrl"
          :mode="mode!"
          @set-analog="setAnalog"
        />
      </template>
      <div></div>
    </Teleport>
  </template>
</template>

<script lang="ts" name="ObjectsLayer" setup>
import { type LngLatBounds, type Map, type Marker, type Offset, type Popup } from 'maplibre-gl'
import maplibre from 'maplibre-gl'
import { currentComparisonList } from '~/app_constants/comparisonConsts'
import { useRealEstateLayer } from '~/composables/ObjectsLayers/useRealEstateLayer'
import { useResearchLayer } from '~/composables/ObjectsLayers/useResearchLayer'
import { useAnalogsComponentLayer } from '~/composables/ObjectsLayers/usAnalogsComponentLayer'
import { useRealtyObjectLayer } from '~/composables/ObjectsLayers/useRealtyObjectLayer'
import { useRouteLayer } from '~/composables/ObjectsLayers/useRouteLayer'
import { useAddToComparisonLayer } from '~/composables/ObjectsLayers/useAddToComparisonLayer'
import { useMixedRealEstateAndRealtyObjectsLayer } from '~/composables/ObjectsLayers/useMixedRealEstateAndRealtyObjectsLayer'
import { useDisplayComparisonRouteLayer } from '~/composables/ObjectsLayers/useDisplayComparisonRouteLayer'
import { objectTypeToText } from '~/app_constants/mergedFieldsConst'
import { calcTypeToPath } from '~/app_constants/routes'
import { api_realty_objects, api_unversal_realty } from '~/app_constants/api'
import RealtyObjectPopup from './RealtyObjectPopup.vue'
import RealEstateObjectPopup from './RealEstateObjectPopup.vue'
import CompareObjectPopup from './CompareObjectPopup.vue'
type modes =
  | 'onlyRealEstateAnalogsComponent'
  | 'onlyRealEstateNoFunctionality'
  | 'onlyRealtyObjectsNoFunctionality'
  | 'researchTab'
  | 'geoTsofRoute'
  | 'addObjectsToCompare'
  | 'mixedRealEstateAndRealtyObjects'
  | 'displayCompareObjects'
const props = defineProps({
  mode: { type: Object as PropType<modes>, required: false },
  // Объект карты MapLibre-gl
  map: { type: Object as PropType<Map>, required: true },
  // Прошла ли инициализация карты
  mapInit: { type: Boolean, required: true },
  // Префикс названия для слоёв MapLibre-gl
  name: { type: String, default: 'objsLayer' },
  // Массив объектов
  items: { type: Array as PropType<Array<any>>, required: true },
  // Выделенный объект
  activeItem: { type: Object as PropType<any>, default: null },
  // Номер первого объекта (для надписей)
  firstNo: { type: Number, default: 1 },
  // Используется ли для ResearchTab
  forResearch: { type: Boolean, default: false },
  // Кастомные маркеры
  isCustomMarkers: { type: Boolean, default: false },
  // Используется ли для AnalogsComponent
  isAnalogsComponent: { type: Boolean, default: false },
})
// onItemSelect(_object) - событие при клике на точке объекта (передаётся объект из массива items)
const emit = defineEmits(['onItemSelect', 'selectAnalog', 'setActiveAnalog'])
const { $calculations, $geoTsofs, $baseURL, $displayCompareObjectStore, $comparison } = useNuxtApp()

const id = ref(0)
// Названия слоёв MapLibre-gl
let sourceName: string = ''
let realtyObjectPolygonsSourceName: string = ''
let routeSourceName: string = ''
let lineLayerName: string = ''
let aimSourceName: string = ''
let circleLayerName: string = ''
let polygonLayerName: string = ''
let labelLayerName: string = ''
let imageLayerName: string = ''
let clusterLayerName: string = ''
let clusterCountLayerName: string = ''
// Границы всех объектов
let bounds: LngLatBounds
let activeItemIndex: number = -1
let hoveredStateId: any
let mapPopup: Popup
const allSourceFeatures: Ref<any[]> = ref([])
const popups: Ref<{ [key: string]: Popup }> = ref({})
let aimMarker: Marker | null = null
let startPointMarker: Marker | null = null
let endPointMarker: Marker | null = null

onMounted(() => {
  const instance = getCurrentInstance()
  if (instance) {
    id.value = instance.uid
    // Названия для источников и слоёв maplibre
    sourceName = props.name + '_' + id.value + '_source'
    realtyObjectPolygonsSourceName = props.name + '_' + id.value + '_realty_object_polygons'
    routeSourceName = props.name + '_' + id.value + '_routesource'
    aimSourceName = props.name + '_' + id.value + '_aimsource'
    circleLayerName = props.name + '_' + id.value + '_points'
    polygonLayerName = props.name + '_' + id.value + '_polygons'
    labelLayerName = props.name + '_' + id.value + '_label'
    imageLayerName = props.name + '_' + id.value + '_image'
    lineLayerName = props.name + '_' + id.value + '_line'
    clusterLayerName = props.name + '_' + id.value + '_cluster'
    clusterCountLayerName = props.name + '_' + id.value + '_cluster_count'
  }
})

onUnmounted(() => {
  removeSourceAndLayers()
})

onUpdated(() => {})
// Кастомные маркеры пропадают при максимальном стандартном зуме. В дальнейшем вся работа с initialMaxZoom нужна чтобы это обойти
let initialMaxZoom: number | null = null

const addSourceAndLayers = () => {
  console.log('addSourceAndLayers mapInit', props.mapInit)
  console.log('addSourceAndLayers activeItem', props.activeItem)
  if (!props.mapInit) return
  console.log('addSourceAndLayers', props.mode, props.items)
  if (props.mode === 'researchTab') {
    removeSourceAndLayers()
    useResearchLayer(
      props.map,
      props.items,
      sourceName,
      circleLayerName,
      polygonLayerName,
      imageLayerName,
      addListenersByMode,
    )
  } else if (props.mode === 'onlyRealEstateNoFunctionality') {
    clearCustomClusters()
    useRealEstateLayer(
      props.map,
      props.items,
      props.activeItem,
      props.firstNo,
      sourceName,
      imageLayerName,
      addListenersByMode,
      addSourceAndLayersSideEffect(props.mode),
    )
  } else if (props.mode === 'onlyRealtyObjectsNoFunctionality') {
    clearCustomClusters()
    useRealtyObjectLayer(
      props.map,
      props.items,
      props.activeItem,
      props.firstNo,
      sourceName,
      realtyObjectPolygonsSourceName,
      imageLayerName,
      polygonLayerName,
      lineLayerName,
      circleLayerName,
      addListenersByMode,
      addSourceAndLayersSideEffect(props.mode),
    )
  } else if (props.mode === 'mixedRealEstateAndRealtyObjects') {
    clearCustomClusters()
    useMixedRealEstateAndRealtyObjectsLayer(
      props.map,
      props.items,
      props.activeItem,
      props.firstNo,
      sourceName,
      imageLayerName,
      addListenersByMode,
      addSourceAndLayersSideEffect(props.mode),
    )
  } else if (props.mode === 'addObjectsToCompare') {
    clearCustomClusters()
    useAddToComparisonLayer(
      props.map,
      props.items,
      props.activeItem,
      props.firstNo,
      sourceName,
      imageLayerName,
      addListenersByMode,
      addSourceAndLayersSideEffect(props.mode),
    )
  } else if (props.mode === 'onlyRealEstateAnalogsComponent') {
    clearCustomClusters()
    useAnalogsComponentLayer(
      props.map,
      props.items,
      props.activeItem,
      props.firstNo,
      sourceName,
      imageLayerName,
      aimMarker,
      addListenersByMode,
      addSourceAndLayersSideEffect(props.mode),
    )
  } else if (props.mode === 'geoTsofRoute') {
    useRouteLayer(
      props.map,
      sourceName,
      lineLayerName,
      startPointMarker,
      endPointMarker,
      addSourceAndLayersSideEffect(props.mode),
    )
    fitBounds()
  } else if (props.mode === 'displayCompareObjects') {
    clearCustomClusters()
    useDisplayComparisonRouteLayer(
      props.map,
      props.items,
      props.activeItem,
      props.firstNo,
      sourceName,
      routeSourceName,
      imageLayerName,
      lineLayerName,
      endPointMarker,
      addListenersByMode,
      addSourceAndLayersSideEffect(props.mode),
    )
    fitBounds()
  }
}

const removeSourceAndLayers = () => {
  if (Object.keys(props.map).length) {
    if (props.map.getLayer(circleLayerName)) {
      props.map.removeLayer(circleLayerName)
    }
    if (props.map.getLayer(polygonLayerName)) {
      props.map.removeLayer(polygonLayerName)
    }
    if (props.map.getLayer(labelLayerName)) {
      props.map.removeLayer(labelLayerName)
    }
    if (props.map.getLayer(imageLayerName)) {
      props.map.removeLayer(imageLayerName)
    }
    if (props.map.getLayer(clusterLayerName)) {
      props.map.removeLayer(clusterLayerName)
    }
    if (props.map.getLayer(clusterCountLayerName)) {
      props.map.removeLayer(clusterCountLayerName)
    }
    if (props.map.getLayer(lineLayerName)) {
      props.map.removeLayer(lineLayerName)
    }

    if (props.map.getSource(sourceName)) {
      props.map.removeSource(sourceName)
    }
    if (props.map.getSource(realtyObjectPolygonsSourceName)) {
      props.map.removeSource(realtyObjectPolygonsSourceName)
    }
    if (props.map.getSource(routeSourceName)) {
      props.map.removeSource(routeSourceName)
    }
  }
}

const update = (toFitBounds: boolean | undefined) => {
  addSourceAndLayers()
  if (toFitBounds) {
    fitBounds()
  }
}

// Масштабировать карту так, чтобы границы объектов полностью попадали в область карты
const fitBounds = () => {
  if (bounds) {
    if ($geoTsofs.isFullScreen) {
      props.map.fitBounds(bounds, { padding: 250, linear: true, maxZoom: 18, offset: [100, 0] })
    } else {
      props.map.fitBounds(bounds, { padding: 50, linear: true, maxZoom: 18 })
    }
  }
}

const fitActiveItem = () => {
  nextTick(() => {
    console.log("fitActiveItem !!__!!", props.activeItem, props.items)
    let activeItemIndexDouble: number | null = null
    for (let i = 0; i < props.items.length; i++) {
      if (Math.abs(props.activeItem.id) === props.items[i].id) {
        activeItemIndex = i
        activeItemIndexDouble = i
        break
      }
    }
    if (activeItemIndex > -1 && activeItemIndexDouble) {
      addSourceAndLayers()
      const actualIndex = activeItemIndex > -1 ? activeItemIndex : activeItemIndexDouble
      const _bounds = new maplibre.LngLatBounds()
      console.log("fitActiveItem !!_??_!!", actualIndex, props.items[actualIndex], props.items, props.activeItem)
      _bounds.extend({
        lon: props.items[actualIndex].geo_pos.coordinates[0],
        lat: props.items[actualIndex].geo_pos.coordinates[1],
      })

      props.map.fitBounds(_bounds, { padding: 50, linear: true, maxZoom: 17 })
    }
    props.map.resize()
  })
}

const updateHoverObject = (event: any) => {
  if (props.mode === 'researchTab') {
    let coordinates
    if (event.features[0].properties.type === 'Polygon') {
      coordinates = event.lngLat
    } else if (event.features[0].properties.type === 'Point') {
      coordinates = event.features[0].geometry.coordinates.slice()
    }

    // if (event.features.length > 0) {
    //   if (hoveredStateId) {
    //     props.map.setFeatureState({ source: sourceName, id: hoveredStateId }, { hover: false })
    //   }
    //   hoveredStateId = event.features[0].id
    //   props.map.setFeatureState({ source: sourceName, id: hoveredStateId }, { hover: true })
    // }

    const index = event.features[0].properties.index
    const _object = props.items[index]
    const icon = `<i class="fas fa-dot-circle" style="color:${event.features[0].properties.color}"></i> `
    let title =
      '<div class="popup-container">' +
      '<div style="font-size: 1.2em" class="popup-container_title">' +
      _object.subtype_name +
      '</div>' +
      (_object.obj_misc.name && _object.obj_misc.name !== 'noname'
        ? '<p class="popup-container_row-text">' + _object.obj_misc.name + '</p>'
        : '') +
      '</div>'

    mapPopup?.remove()
    mapPopup = new maplibre.Popup({
      closeButton: false,
      closeOnClick: false,
    })
    mapPopup.setLngLat(coordinates).setHTML(title).addTo(props.map)
  }
}

// Событие при наведении на точку объекта
const onObjectMouseEnter = (event: any) => {
  props.map.getCanvas().style.cursor = 'pointer'
  updateHoverObject(event)
}

const onObjectMouseMove = (event: any) => {
  updateHoverObject(event)
}

// Событие при уходе с точки объекта
const onObjectMouseLeave = (event: any) => {
  // if (hoveredStateId) {
  //   props.map.setFeatureState({ source: sourceName, id: hoveredStateId }, { hover: false })
  //   hoveredStateId = null
  // }
  props.map.getCanvas().style.cursor = ''
  mapPopup?.remove()
}

// Событие при клике на точке объекта
const onObjectClick = (event: any) => {
  console.log('onObjectClick')
  const index = event.features[0].properties.index
  const _object = props.items[index]

  emit('onItemSelect', _object)
}

// Событие по клику на кластере (приближение карты)
const onClusterClick = async (event: any) => {
  var features = props.map.queryRenderedFeatures(event.point, {
    layers: [clusterLayerName],
  })
  var clusterId = features[0].properties.cluster_id
  const source: any = props.map.getSource(sourceName)

  const _zoom = await source?.getClusterExpansionZoom(clusterId)
  props.map.easeTo({
    center: (features[0].geometry as any).coordinates,
    zoom: _zoom,
  })
}

// Событие по наведению на точке кластера
const onClusterMouseEnter = (event: any) => {
  props.map.getCanvas().style.cursor = 'pointer'

  var coordinates = event.features[0].geometry.coordinates.slice()
  // TODO
  // if (event.features.length > 0) {
  //   if (hoveredStateId) {
  //     props.map.setFeatureState({ source: sourceName, id: hoveredStateId }, { hover: false })
  //   }
  //   hoveredStateId = event.features[0].id
  //   props.map.setFeatureState({ source: sourceName, id: hoveredStateId }, { hover: true })
  // }

  const color = '#ff0000'
  const pointCount = event.features[0].properties.point_count
  const pointCountLabel = 'в точке ' + pointCount + (pointCount <= 4 ? ' объекта' : ' объектов')
  const icon = `<i class="fas fa-dot-circle" style="color:#000"></i>`
  const title =
    `<div style="font-size: 1.2em;">` +
    icon +
    ` Группа объектов</div><div style="margin-left: 20px;">(${pointCountLabel})</div>`
  const clusterId = event.features[0].properties.cluster_id
  const source: any = props.map.getSource(sourceName)
  source?.getClusterChildren(clusterId, function (err: Error, features: any) {
    if (err) return
  })
  mapPopup = new maplibre.Popup({
    closeButton: false,
    closeOnClick: false,
  })
  mapPopup.setLngLat(coordinates).setHTML(title).addTo(props.map)
}

// Событие по уходу с точки кластера
const onClusterMouseLeave = (event: any) => {
  props.map.getCanvas().style.cursor = ''
  mapPopup?.remove()
}

const onUpdatePopup = (object: any) => {
  emit('selectAnalog', object, false)
  addSourceAndLayers()
}
defineExpose({
  update,
  fitActiveItem,
})

const render = () => {
  return ''
}
let markers: { [key: string]: Marker } = {}
let markersOnScreen: { [key: string]: Marker } = {}
let clickedMarker: null | number = null

function updateMarkers() {
  const newMarkers: { [key: string]: Marker } = {}
  const newUnclusteredAnalogsMarkers: any = {}
  let features = props.map.querySourceFeatures(sourceName)
  if (!features.length && props.map.getSource(sourceName)) {
    // @ts-ignore
    features = props.map.getSource(sourceName)._data.features
  }
  for (const feature of features) {
    const coords = (feature.geometry as any).coordinates
    const properties = feature.properties
    if (feature.properties.type === 'Polygon') {
      continue
    }
    if (!properties.cluster) {
      const id = feature.properties.id
      newUnclusteredAnalogsMarkers[id!] = createAnalogMarker(feature)
    } else {
      const id = properties.cluster_id
      let marker = markers[id]
      if (!marker) {
        const el = createDonutChart(properties, coords)

        if (el instanceof HTMLElement) {
          marker = markers[id] = new maplibre.Marker({
            element: el,
            anchor: 'left',
          }).setLngLat(coords)

          const clickElement = marker
            .getElement()
            .getElementsByClassName('zoomToCluster' + properties.cluster_id)[0] as HTMLElement | undefined
          if (clickElement) {
            // Проверяем, что элемент не undefined
            clickElement.addEventListener('click', async () => {
              await zoomToCluster(properties.cluster_id, coords)
            })
          }
        }
      }
      if (marker) {
        newMarkers[id] = marker

        if (!markersOnScreen[id]) {
          marker.addClassName('custom_analog_cluster' + id)
          marker.addTo(props.map)
        }
      }
    }
  }

  // Удаление невидимых маркеров
  for (const i in markersOnScreen) {
    if (!newMarkers[i]) {
      markersOnScreen[i]?.remove()
    }
  }
  for (const i in unclusteredMarkersOnScreen) {
    if (!newUnclusteredAnalogsMarkers[i]) {
      unclusteredMarkersOnScreen[i]?.remove()
    }
  }

  markersOnScreen = newMarkers
  unclusteredMarkersOnScreen = newUnclusteredAnalogsMarkers
}

function createDonutChart(propsObj: any, point: any) {
  const featuresIds: string[] = propsObj.ids.split(',')
  const features = allSourceFeatures.value.filter(
    (item) => featuresIds.includes(item.id.toString()) && item.properties.type !== 'Polygon',
  )

  let html
  if (propsObj.point_count > 5) {
    let unselectedItems = `<div class="clickable-cluster-summary${
      propsObj.cluster_id
    }">${propsObj.point_count.toLocaleString()} шт.</div>`
    html = `<div class="custom-cluster"><i class="icon ${props.mode === 'addObjectsToCompare' || props.mode === 'displayCompareObjects' ? 'fi_compare' : 'fi_disc'} me-2 zoomToCluster ${'zoomToCluster' + propsObj.cluster_id}" id=${'zoomToCluster' + propsObj.cluster_id}></i>${unselectedItems}</div>`
  } else {
    let items: string[] = []
    features.forEach((item, index) => {
      if (item.properties.selected) {
        let selectedItem = `<div type="button" class="${index !== propsObj.point_count - 1 ? 'custom-cluster_bordered' : ''} ${' clickable-analog-inside-cluster' + item.id}"><i class="icon fi_scale-left me-1"></i>${item.properties.no.split('#')[1].toLocaleString()} </div>`
        items.push(selectedItem)
      } else {
        let unselectedItem = `<div type="button" class="${index !== propsObj.point_count - 1 ? 'custom-cluster_bordered' : ''} ${' clickable-analog-inside-cluster' + item.id}">${item.properties.no.split('#')[1].toLocaleString()} </div>`
        items.push(unselectedItem)
      }
    })
    html = `<div class="custom-cluster clickable-cluster-summary${
      propsObj.cluster_id
    }"><i class="icon ${props.mode === 'addObjectsToCompare' || props.mode === 'displayCompareObjects' ? 'fi_compare' : 'fi_disc'} me-2 zoomToCluster ${'zoomToCluster' + propsObj.cluster_id}" id=${'zoomToCluster' + propsObj.cluster_id}></i>  ${items.join('')} </div>`
  }

  const el = document.createElement('div')
  el.innerHTML = html

  const element = el.getElementsByClassName('clickable-cluster-summary' + propsObj.cluster_id)[0] as HTMLElement | null
  if (element) {
    element.addEventListener('click', () => {
      const title = `<div id='customClusterPopup${-propsObj.cluster_id}' class="custom-cluster-popup"></div>`
      const popup = new maplibre.Popup({ offset: [15, 0] })
      popup.setHTML(title)
      markersOnScreen[propsObj.cluster_id].setPopup(popup)
      popup.on('close', () => {
        clearOpenedPopupInfo()
      })
      popups.value[-propsObj.cluster_id] = popup
      openedPopupObjectId.value = -propsObj.cluster_id

      setAnalog = () => {
        onUpdatePopup(objectsInCluster.value[currentObjectInCluster.value])
        markers[propsObj.cluster_id]?.remove()
        delete markers[propsObj.cluster_id]
      }
      popup._update = customUpdatePosition
      setTimeout(() => {
        currentObjectInCluster.value = 0
        objectsInCluster.value = features.map((feature) => {
          const obj = props.items[feature.properties.index]
          return {
            ...feature,
            object: obj,
          }
        })
        emitObjectSelect(objectsInCluster.value[0].object)
        currentAnalogPopupID.value = `customClusterPopup${-propsObj.cluster_id}`
        nextTick(() => {
          const scrollContainer = document.getElementById('objects-in-cluster-scrollbar') as HTMLElement

          scrollContainer.addEventListener('wheel', (e) => {
            e.preventDefault()
            scrollContainer.scrollLeft += e.deltaY
          })
          popups.value[-propsObj.cluster_id].setMaxWidth('fit-content')
        })
      }, 0)
    })
  } else {
    console.error('Element not found: customClusterPopup')
  }

  return el.firstChild
}

let unclusteredMarkers: { [key: string]: Marker } = {}
let unclusteredMarkersOnScreen: { [key: string]: Marker } = {}
const currentAnalogPopupID = ref('')
const currentAnalogPopupObject = ref<Record<string, any>>({})
const isCurrentObjectIsRealtyObject = ref(false)
const openedPopupObjectId = ref(0)
const objectsInCluster = ref<Record<string, any>[]>([])
const currentObjectInCluster = ref(0)
function createAnalogMarker(feature: any) {
  const id = +feature.id
  let marker = unclusteredMarkers[id]
  if (!marker) {
    let item
    if (feature.properties.selected) {
      item = `<div type="button" class=""><i class="icon fi_scale-left me-1"></i>${feature.properties.no.split('#')[1].toLocaleString()} </div>`
    } else {
      item = `<div type="button" class="">${feature.properties.no.split('#')[1].toLocaleString()} </div>`
    }
    let html = `<div class="custom-cluster"><i class="icon ${props.mode === 'addObjectsToCompare' || props.mode === 'displayCompareObjects' ? 'fi_compare' : 'fi_disc'} me-2"></i>  ${item} </div>`
    const el = document.createElement('div')

    el.innerHTML = html

    const coords = feature.geometry.coordinates
    const element = el.firstChild instanceof HTMLElement ? el.firstChild : null

    if (element) {
      marker = unclusteredMarkers[id] = new maplibre.Marker({
        element: element,
        anchor: 'left',
      }).setLngLat(coords)
    }
    unclusteredMarkers[id].getElement().addEventListener('click', () => {
      const coordinates = feature.geometry.coordinates.slice()

      const isAddedToCalc = feature.properties.selected
      const _object = props.items.filter((item) => item.id === id)[0]

      const title = `<div id='customAnalogPopup${_object.id}' class="custom-annalog-popup d-flex"></div>`
      const popup = new maplibre.Popup({
        offset: [15, 0],
      })
      popups.value[id] = popup
      openedPopupObjectId.value = _object.id
      isCurrentObjectIsRealtyObject.value = !!_object.realty_cards
      setAnalog = () => {
        onUpdatePopup(_object)
        unclusteredMarkers[id]?.remove()
        delete unclusteredMarkers[id]
      }
      popup._update = customUpdatePosition
      popup.setLngLat(coordinates).setHTML(title)
      // popup._map = props.map
      unclusteredMarkers[id].setPopup(popup)
      // popup.addTo(props.map)
      popup.on('close', () => {
        clearOpenedPopupInfo()
      })

      setTimeout(() => {
        getFileImage(_object.id)
        currentAnalogPopupObject.value = _object

        currentAnalogPopupID.value = 'customAnalogPopup' + _object.id
        nextTick(() => {
          popups.value[_object.id].setMaxWidth('fit-content')
        })
      }, 0)
      emitObjectSelect(_object)
    })
  }
  if (!unclusteredMarkersOnScreen[id]) {
    unclusteredMarkers[id].addTo(props.map).addClassName('custom_analog_circle' + id)
  }
  return marker
}

function createHTMLElForPopup(_object: any, feature: any, isAddedToCalc: boolean) {
  if (props.mode === 'onlyRealEstateAnalogsComponent' || props.mode === 'onlyRealEstateNoFunctionality') {
    const titleByObject: { [key: string]: any } = {
      OA: 'Предложение',
      OO: 'Объект оценки',
      NE: 'Объект НЭИ',
    }
    const propertyByObject: { [key: string]: any } = {
      OA:
        '<span class="popup-container_row-title">Удельная цена, руб. за кв. м: </span>' +
        (_object.price_sale_per_m ? _object.price_sale_per_m : '<удельная цена не задана'),
      OO:
        '<span class="popup-container_row-title">Площадь, кв. м: </span>' +
        (_object.object_area ? _object.object_area : '<площадь не задана'),
      NE:
        '<span class="popup-container_row-title">Площадь, кв. м: </span>' +
        (_object.object_area ? _object.object_area : '<площадь не задана'),
    }
    return (
      '<div class="popup-container">' +
      '<div style="font-size: 1.2em" class="popup-container_title">' +
      titleByObject[_object.object_type_calc] +
      feature.properties.no +
      '</div><p class="popup-container_row-text">' +
      '<span class="popup-container_row-title">Адрес: </span>' +
      (_object.address_raw ? _object.address_raw : '<адрес не задан>') +
      '</p><p class="popup-container_row-text">' +
      '<span class="popup-container_row-title">Статус: </span>' +
      (_object.is_checked ? 'Проверен' : 'Не проверен') +
      `</p><p class="popup-container_row-text ${props.mode === 'onlyRealEstateAnalogsComponent' ? 'popup-container_bordered' : ''}">` +
      propertyByObject[_object.object_type_calc] +
      (props.mode === 'onlyRealEstateAnalogsComponent'
        ? `</p><button class="popup-container_add-to-calc btn add-to-calc_${feature.id}" id="add-to-calc_${feature.id}"> <i class="icon ${!isAddedToCalc ? 'fi_scale-left' : 'fi_minus'} me-1"> </i> <div>${!isAddedToCalc ? 'Добавить в расчёт' : 'Удалить из расчёта'} </div> </button>`
        : '') +
      '</div>'
    )
  } else if (props.mode === 'onlyRealtyObjectsNoFunctionality') {
    const icon: Record<string, any> = {
      Q: 'icon ksi_premise icon-lg',
      B: 'icon ksi_building icon-lg',
    }
    return (
      '<div class="popup-container">' +
      '<div style="font-size: 1.2em" class="popup-container_title">' +
      `<i class="${icon[_object.object_type]} me-2" ></i>` +
      _object.name +
      '</div><p class="popup-container_row-text">' +
      (_object.address_raw ? _object.address_raw : '<адрес не задан>') +
      '</p>' +
      '</div>'
    )
  } else if (props.mode === 'mixedRealEstateAndRealtyObjects') {
    if (_object.realty_cards) {
      const icon: Record<string, any> = {
        Q: 'icon ksi_premise icon-lg',
        B: 'icon ksi_building icon-lg',
      }

      return (
        '<div class="popup-container">' +
        '<div style="font-size: 1.2em" class="popup-container_title">' +
        `<i class="${icon[_object.object_type]} me-2" ></i>` +
        _object.name +
        '</div><p class="popup-container_row-text">' +
        (_object.address_raw ? _object.address_raw : '<адрес не задан>') +
        '</p>' +
        '</div>'
      )
    } else {
      const titleByObject: { [key: string]: any } = {
        OA: 'Предложение',
        OO: 'Объект оценки',
        NE: 'Объект НЭИ',
      }
      const propertyByObject: { [key: string]: any } = {
        OA:
          '<span class="popup-container_row-title">Удельная цена, руб. за кв. м: </span>' +
          (_object.price_sale_per_m ? _object.price_sale_per_m : '<удельная цена не задана'),
        OO:
          '<span class="popup-container_row-title">Площадь, кв. м: </span>' +
          (_object.object_area ? _object.object_area : '<площадь не задана'),
        NE:
          '<span class="popup-container_row-title">Площадь, кв. м: </span>' +
          (_object.object_area ? _object.object_area : '<площадь не задана'),
      }
      return (
        '<div class="popup-container">' +
        '<div style="font-size: 1.2em" class="popup-container_title">' +
        titleByObject[_object.object_type_calc] +
        feature.properties.no +
        '</div><p class="popup-container_row-text">' +
        '<span class="popup-container_row-title">Адрес: </span>' +
        (_object.address_raw ? _object.address_raw : '<адрес не задан>') +
        '</p><p class="popup-container_row-text">' +
        '<span class="popup-container_row-title">Статус: </span>' +
        (_object.is_checked ? 'Проверен' : 'Не проверен') +
        `</p><p class="popup-container_row-text">` +
        propertyByObject[_object.object_type_calc] +
        '</div>'
      )
    }
    // if (_object.type === '')
  } else return ''
}

let setAnalog = () => {}

function setCurrentObjectInCluster(i: number) {
  if (i < 0 || i > objectsInCluster.value.length - 1) return
  imageUrl.value = ''
  currentObjectInCluster.value = i
  getFileImage(objectsInCluster.value[i].id)
  emitObjectSelect(objectsInCluster.value[i].object)
}

function emitObjectSelect(obj: Record<string, any>) {
  if (props.mode === 'addObjectsToCompare') {
    let newObj
    if (!obj?.object_type) {
      newObj = {
        ...obj,
        id: obj.id * -1,
      }
    } else {
      newObj = {
        ...obj,
      }
    }
    emit('onItemSelect', newObj)
  } else {
    emit('onItemSelect', obj)
  }
}

function clearOpenedPopupInfo() {
  controller.abort()
  isImageLoading.value = false
  imageUrl.value = ''
  currentAnalogPopupID.value = ''
  currentAnalogPopupObject.value = {}
  isCurrentObjectIsRealtyObject.value = false
  objectsInCluster.value = []
  currentObjectInCluster.value = 0
}

function removeAnalogsAndClusterMarkers() {
  for (const id in markers) {
    markers[id].remove()
  }
  for (const id in unclusteredMarkers) {
    unclusteredMarkers[id].remove()
  }
  markers = {}
  unclusteredMarkers = {}
}

function onData(e: any) {
  console.log('onData')
  if (e.sourceId !== sourceName || !e.isSourceLoaded) return

  updateMarkers()
  props.map.on('move', updateMarkers)
  props.map.on('moveend', updateMarkers)
}

async function zoomToCluster(cluster_id: number, coordinates: any) {
  const source: any = props.map.getSource(sourceName)

  const _zoom = await source?.getClusterExpansionZoom(cluster_id)

  if (_zoom > props.map.getMaxZoom() && props.map.getMaxZoom() === initialMaxZoom) {
    props.map.setMaxZoom(props.map.getMaxZoom() * 0.999)
  }
  if (props.map.getZoom() !== props.map.getMaxZoom()) {
    props.map.easeTo({
      center: coordinates,
      zoom: _zoom > props.map.getMaxZoom() ? props.map.getMaxZoom() : _zoom * 1.001,
    })
  }
}

function addListenersByMode() {
  if (props.mode === 'researchTab') {
    props.map.on('mouseenter', circleLayerName, onObjectMouseEnter)
    props.map.on('mouseleave', circleLayerName, onObjectMouseLeave)
    props.map.on('mouseenter', polygonLayerName, onObjectMouseEnter)
    props.map.on('mouseleave', polygonLayerName, onObjectMouseLeave)
  }
  if (props.mode === 'onlyRealEstateNoFunctionality') {
    props.map.on('data', onData)
    props.map.on('click', circleLayerName, onObjectClick)
  }
  if (props.mode === 'onlyRealEstateAnalogsComponent') {
    props.map.on('data', onData)
    props.map.on('click', circleLayerName, onObjectClick)
  }
  if (props.mode === 'onlyRealtyObjectsNoFunctionality') {
    props.map.on('data', onData)
    props.map.on('click', circleLayerName, onObjectClick)
  }
  if (props.mode === 'mixedRealEstateAndRealtyObjects') {
    props.map.on('data', onData)
    props.map.on('click', circleLayerName, onObjectClick)
  }
  if (props.mode === 'addObjectsToCompare') {
    props.map.on('data', onData)
    props.map.on('click', circleLayerName, onObjectClick)
  }
  if (props.mode === 'displayCompareObjects') {
    props.map.on('data', onData)
    props.map.on('click', circleLayerName, onObjectClick)
  }
}

function clearCustomClusters() {
  for (const index in popups.value) {
    popups.value[index].remove()
  }
  popups.value = {}
  removeAnalogsAndClusterMarkers()
  removeSourceAndLayers()
  props.map.off('click', circleLayerName, onObjectClick)
}
function addSourceAndLayersSideEffect(mode: modes) {
  if (
    mode === 'onlyRealEstateNoFunctionality' ||
    mode === 'onlyRealEstateAnalogsComponent' ||
    mode === 'onlyRealtyObjectsNoFunctionality' ||
    mode === 'addObjectsToCompare' ||
    mode === 'mixedRealEstateAndRealtyObjects'
  ) {
    return (boundsComposable: LngLatBounds, boundaryObjectsComposable: any[], activeItemIndexComposable: number) => {
      bounds = boundsComposable
      console.log(boundsComposable)
      allSourceFeatures.value = [...boundaryObjectsComposable]
      activeItemIndex = activeItemIndexComposable
    }
  } else if (mode === 'geoTsofRoute') {
    return (boundsComposable: LngLatBounds, startPointMarkerComposable: Marker, endPointMarkerComposable: Marker) => {
      bounds = boundsComposable
      startPointMarker?.remove()
      endPointMarker?.remove()
      startPointMarker = startPointMarkerComposable
      endPointMarker = endPointMarkerComposable
    }
  } else if (mode === 'displayCompareObjects') {
    return (
      boundsComposable: LngLatBounds,
      endPointMarkerComposable: Marker,
      boundaryObjectsComposable: any[],
      activeItemIndexComposable: number,
    ) => {
      bounds = boundsComposable
      startPointMarker?.remove()

      endPointMarker = endPointMarkerComposable
      allSourceFeatures.value = [...boundaryObjectsComposable]
      activeItemIndex = activeItemIndexComposable
    }
  }
}

// Подгрузка картинки
import mime from 'mime'
const controller = new AbortController()
const signal = controller.signal
const imageUrl = ref('')
const isImageLoading = ref(false)
function getFileImage(id: number) {
  if (props.mode === 'addObjectsToCompare' || props.mode === 'displayCompareObjects') return
  isImageLoading.value = true
  return $http
    .get((isCurrentObjectIsRealtyObject.value ? api_realty_objects : api_unversal_realty) + id, { signal })
    .then((res) => {
      const fileImageArr = res._data.files.filter((file: any) => isImage(file.name))
      if (fileImageArr.length) {
        imageUrl.value = $baseURL + fileImageArr[0].url
      } else imageUrl.value = ''

      isImageLoading.value = false
    })
}
function isImage(name: string) {
  if (typeof mime.getType(name) === 'string') {
    return mime.getType(name)!.includes('image/')
  } else {
    return false
  }
}
const imageCssProp = computed(() => {
  if (imageUrl.value) {
    return {
      backgroundImage: `url(${imageUrl.value})`,
      minWidth: '200px',
      maxWidth: '200px',
      maxHeight: '210px',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
    }
  } else
    return {
      minWidth: '200px',
      maxWidth: '200px',
      maxHeight: '210px',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#f1f2f3',
    }
})

const isOpenCurrentCompareVal = computed(() => $comparison.compareId === currentComparisonList)

//
function customUpdatePosition() {
  const popup = popups.value[openedPopupObjectId.value]
  const hasPosition = popup._lngLat || popup._trackPointer

  if (!popup._map || !hasPosition || !popup._content) {
    return
  }

  if (!popup._container) {
    popup._container = DOM.create('div', 'maplibregl-popup', popup._map.getContainer())
    popup._tip = DOM.create('div', 'maplibregl-popup-tip', popup._container)
    popup._container.appendChild(popup._content)
    if (popup.options.className) {
      for (const name of popup.options.className.split(' ')) {
        popup._container.classList.add(name)
      }
    }

    if (popup._closeButton) {
      popup._closeButton.setAttribute('aria-label', popup._map._getUIString('Popup.Close'))
    }

    if (popup._trackPointer) {
      popup._container.classList.add('maplibregl-popup-track-pointer')
    }
  }

  if (popup.options.maxWidth && popup._container.style.maxWidth !== popup.options.maxWidth) {
    popup._container.style.maxWidth = popup.options.maxWidth
  }

  if (popup._map.transform.renderWorldCopies && !popup._trackPointer) {
    popup._lngLat = smartWrap(popup._lngLat, popup._flatPos, popup._map.transform)
  } else {
    popup._lngLat = popup._lngLat?.wrap()
  }

  const pos = popup._map.project(popup._lngLat)

  const offset = normalizeOffset(popup.options.offset)
  let anchor
  const width = popup._container.offsetWidth
  const height = popup._container.offsetHeight
  let anchorComponents: any[]

  if (pos.y > popup._map.transform.height / 2) {
    anchorComponents = ['bottom']
  } else if (pos.y < popup._map.transform.height / 2) {
    anchorComponents = ['top']
  } else {
    anchorComponents = []
  }

  if (pos.x < width / 2) {
    anchorComponents.push('left')
  } else if (pos.x > popup._map.transform.width - width / 2) {
    anchorComponents.push('right')
  }

  if (anchorComponents.length === 0) {
    anchor = 'bottom'
  } else {
    anchor = anchorComponents.join('-') as any
  }

  // @ts-ignore
  let offsetedPos = pos.add(offset[anchor])

  if (!popup.options.subpixelPositioning) {
    offsetedPos = offsetedPos.round()
  }
  const additionalYOffset = {
    bottom: -15,
    'bottom-left': -15,
    'bottom-right': -15,
    top: 15,
    'top-right': 15,
    'top-left': 15,
  }

  DOM.setTransform(
    popup._container,
    // @ts-ignore
    `${anchorTranslate[anchor]} translate(${offsetedPos.x}px,${offsetedPos.y + additionalYOffset[anchor]}px)`,
  )
  applyAnchorClass(popup._container, anchor, 'popup')
}

function normalizeOffset(offset?: Offset | null) {
  if (!offset) {
    return normalizeOffset(new maplibre.Point(0, 0))
  } else if (typeof offset === 'number') {
    // input specifies a radius from which to calculate offsets at all positions
    const cornerOffset = Math.round(Math.abs(offset) / Math.SQRT2)
    return {
      center: new maplibre.Point(0, 0),
      top: new maplibre.Point(0, offset),
      'top-left': new maplibre.Point(cornerOffset, cornerOffset),
      'top-right': new maplibre.Point(-cornerOffset, cornerOffset),
      bottom: new maplibre.Point(0, -offset),
      'bottom-left': new maplibre.Point(cornerOffset, -cornerOffset),
      'bottom-right': new maplibre.Point(-cornerOffset, -cornerOffset),
      left: new maplibre.Point(offset, 0),
      right: new maplibre.Point(-offset, 0),
    }
  } else if (offset instanceof maplibre.Point || Array.isArray(offset)) {
    // input specifies a single offset to be applied to all positions
    const convertedOffset = maplibre.Point.convert(offset)
    return {
      center: convertedOffset,
      top: convertedOffset,
      'top-left': convertedOffset,
      'top-right': convertedOffset,
      bottom: convertedOffset,
      'bottom-left': convertedOffset,
      'bottom-right': convertedOffset,
      left: convertedOffset,
      right: convertedOffset,
    }
  } else {
    // input specifies an offset per position
    return {
      center: maplibre.Point.convert(offset['center'] || [0, 0]),
      top: maplibre.Point.convert(offset['top'] || [0, 0]),
      'top-left': maplibre.Point.convert(offset['top-left'] || [0, 0]),
      'top-right': maplibre.Point.convert(offset['top-right'] || [0, 0]),
      bottom: maplibre.Point.convert(offset['bottom'] || [0, 0]),
      'bottom-left': maplibre.Point.convert(offset['bottom-left'] || [0, 0]),
      'bottom-right': maplibre.Point.convert(offset['bottom-right'] || [0, 0]),
      left: maplibre.Point.convert(offset['left'] || [0, 0]),
      right: maplibre.Point.convert(offset['right'] || [0, 0]),
    }
  }
}

class DOM {
  private static readonly docStyle =
    typeof window !== 'undefined' && window.document && window.document.documentElement.style

  private static userSelect: string

  private static selectProp = DOM.testProp(['userSelect', 'MozUserSelect', 'WebkitUserSelect', 'msUserSelect'])

  private static transformProp = DOM.testProp(['transform', 'WebkitTransform'])
  public static create<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    className?: string,
    container?: HTMLElement,
  ): HTMLElementTagNameMap[K] {
    const el = window.document.createElement(tagName)
    if (className !== undefined) el.className = className
    if (container) container.appendChild(el)
    return el
  }
  private static testProp(props: string[]): string {
    if (!DOM.docStyle) return props[0]
    for (let i = 0; i < props.length; i++) {
      if (props[i] in DOM.docStyle) {
        return props[i]
      }
    }
    return props[0]
  }

  public static setTransform(el: HTMLElement, value: string) {
    // @ts-ignore
    el.style[DOM.transformProp] = value
  }
}

type PositionAnchor =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

const anchorTranslate: {
  [_ in PositionAnchor]: string
} = {
  center: 'translate(-50%,-50%)',
  top: 'translate(-50%,0)',
  'top-left': 'translate(0,0)',
  'top-right': 'translate(-100%,0)',
  bottom: 'translate(-50%,-100%)',
  'bottom-left': 'translate(0,-100%)',
  'bottom-right': 'translate(-100%,-100%)',
  left: 'translate(0,-50%)',
  right: 'translate(-100%,-50%)',
}

function applyAnchorClass(element: HTMLElement, anchor: PositionAnchor, prefix: string) {
  const classList = element.classList
  for (const key in anchorTranslate) {
    classList.remove(`maplibregl-${prefix}-anchor-${key}`)
  }
  classList.add(`maplibregl-${prefix}-anchor-${anchor}`)
}

function smartWrap(lngLat: any, priorPos: any, transform: any): any {
  const originalLngLat = new maplibre.LngLat(lngLat.lng, lngLat.lat)
  lngLat = new maplibre.LngLat(lngLat.lng, lngLat.lat)

  // First, try shifting one world in either direction, and see if either is closer to the
  // prior position. This preserves object constancy when the map center is auto-wrapped
  // during animations.
  if (priorPos) {
    const left = new maplibre.LngLat(lngLat.lng - 360, lngLat.lat)
    const right = new maplibre.LngLat(lngLat.lng + 360, lngLat.lat)
    const delta = transform.locationPoint(lngLat).distSqr(priorPos)
    if (transform.locationPoint(left).distSqr(priorPos) < delta) {
      lngLat = left
    } else if (transform.locationPoint(right).distSqr(priorPos) < delta) {
      lngLat = right
    }
  }

  // Second, wrap toward the center until the new position is on screen, or we can't get
  // any closer.
  while (Math.abs(lngLat.lng - transform.center.lng) > 180) {
    const pos = transform.locationPoint(lngLat)
    if (pos.x >= 0 && pos.y >= 0 && pos.x <= transform.width && pos.y <= transform.height) {
      break
    }
    if (lngLat.lng > transform.center.lng) {
      lngLat.lng -= 360
    } else {
      lngLat.lng += 360
    }
  }

  // Apply the change only if new coord is below horizon
  if (
    lngLat.lng !== originalLngLat.lng &&
    transform.locationPoint(lngLat).y > transform.height / 2 - transform.getHorizon()
  ) {
    return lngLat
  }

  return originalLngLat
}

// вотчеры должны быть в конце
watch(
  () => props.mapInit,
  () => {
    console.log(props.mapInit, props.items)
    if (!props.mapInit) return
    nextTick(() => {
      initialMaxZoom = props.map.getMaxZoom()
      props.map.on('zoomend', () => {
        if (props.map.getZoom() === props.map.getMaxZoom()) {
          props.map.doubleClickZoom.disable()
        } else {
          props.map.doubleClickZoom.enable()
        }
      })
      if (props.items?.length > 0 || props.mode === 'geoTsofRoute') {
        addSourceAndLayers()

        fitBounds()
      }
    })
  },
  { immediate: true },
)
watch(
  () => props.items,
  () => {
    console.log('watcher props.items', props.items)
    addSourceAndLayers()
    if (props.mode !== 'researchTab') {
      fitBounds()
    }
    // if (props.isCustomMarkers) {
    //   for (const index in popups.value) {
    //     popups.value[index].remove()
    //   }
    //   popups.value = {}
    // }
  },
)
if (props.mode === 'geoTsofRoute') {
  watch(
    () => props.activeItem,
    () => {
      removeSourceAndLayers()
      addSourceAndLayers()
    },
    { immediate: true },
  )
}
if (props.mode === 'displayCompareObjects') {
  watch(
    () => $displayCompareObjectStore.route,
    () => {
      removeSourceAndLayers()
      addSourceAndLayers()
    },
    { immediate: true },
  )
}
</script>
