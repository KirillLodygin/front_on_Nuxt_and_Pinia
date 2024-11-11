<!--
  Загрузка объявлений или объектов гео-слоя, вывод их на карте.
  Выводятся точки или полигоны в зависимости от содержимого гео-слоя.
  При наведении на точку/полигон выводится попап с описанием объекта.
  Используется внутри тэга MapComponent
-->
<template>
  <template v-if="popupMode === 'G'">
    <template v-if="currentAnalogPopupID && featuresIds.length" :key="currentAnalogPopupID + featuresIds.length">
      <Teleport :to="'#' + currentAnalogPopupID">
        <div class="wrap d-flex align-items-center objects-in-cluster-scrollbar">
          <i
            class="icon fi_chevron-left align-self-center"
            :class="{ 'objects-in-cluster-scrollbar__disabled': currentObjectInCluster - 1 < 0 || isObjectLoading }"
            @click="setCurrentObjectInCluster(currentObjectInCluster - 1)"
          />
          <div
            id="objects-in-cluster-scrollbar"
            class="overflow-x-scroll overflow-y-hidden functional-buttons-scroll d-flex align-items-center h-100 p-0"
          >
            <div
              v-for="(obj, index) in featuresIds"
              :key="index"
              class="objects-in-cluster-item px-1"
              :class="{ 'objects-in-cluster-item__active': +index === currentObjectInCluster }"
              style="min-width: fit-content"
              @click="setCurrentObjectInCluster(+index)"
            >
              {{ index + 1 }}
            </div>
          </div>
          <i
            class="icon fi_chevron-right align-self-center"
            :class="{
              'objects-in-cluster-scrollbar__disabled':
                currentObjectInCluster + 1 > featuresIds.length - 1 || isObjectLoading,
            }"
            @click="setCurrentObjectInCluster(currentObjectInCluster + 1)"
          />
        </div>

        <div id="setter" class="custom-annalog-popup d-flex" style="max-height: 200px">
          <GeoObjectPopup
            :current-analog-popup-object="currentAnalogPopupObject.obj_misc"
            :label="currentAnalogPopupObject.label"
            :to-show-loader="isObjectLoading"
          />
        </div>
      </Teleport>
    </template>
    <template v-else-if="currentAnalogPopupID" :key="currentAnalogPopupID">
      <Teleport :to="'#' + currentAnalogPopupID">
        <GeoObjectPopup
          :current-analog-popup-object="currentAnalogPopupObject.obj_misc"
          :label="currentAnalogPopupObject.label"
          :to-show-loader="isObjectLoading"
        />
      </Teleport>
    </template>
  </template>
  <template v-else-if="popupMode === 'A'">
    <template v-if="currentAnalogPopupID && featuresIds.length" :key="currentAnalogPopupID + featuresIds.length">
      <Teleport :to="'#' + currentAnalogPopupID">
        <div class="wrap d-flex align-items-center objects-in-cluster-scrollbar">
          <i
            class="icon fi_chevron-left align-self-center"
            :class="{ 'objects-in-cluster-scrollbar__disabled': currentObjectInCluster - 1 < 0 || isObjectLoading }"
            @click="setCurrentObjectInCluster(currentObjectInCluster - 1)"
          />
          <div
            id="objects-in-cluster-scrollbar"
            class="overflow-x-scroll overflow-y-hidden functional-buttons-scroll d-flex align-items-center h-100 p-0"
          >
            <div
              v-for="(obj, index) in featuresIds"
              :key="index"
              class="objects-in-cluster-item px-1"
              :class="{ 'objects-in-cluster-item__active': +index === currentObjectInCluster }"
              style="min-width: fit-content"
              @click="setCurrentObjectInCluster(+index)"
            >
              {{ index + 1 }}
            </div>
          </div>
          <i
            class="icon fi_chevron-right align-self-center"
            :class="{
              'objects-in-cluster-scrollbar__disabled':
                currentObjectInCluster + 1 > featuresIds.length - 1 || isObjectLoading,
            }"
            @click="setCurrentObjectInCluster(currentObjectInCluster + 1)"
          />
        </div>

        <div id="setter" class="custom-annalog-popup d-flex" style="height: 186px">
          <RealEstateObjectPopup
            :current-analog-popup-object="currentAnalogPopupObject"
            :image-css-prop="imageCssProp"
            :to-show-loader="isObjectLoading"
            :mode="''"
            :full-loader="true"
          />
        </div>
      </Teleport>
    </template>
    <template v-else-if="currentAnalogPopupID" :key="currentAnalogPopupID">
      <Teleport :to="'#' + currentAnalogPopupID">
        <template v-if="currentAnalogPopupObject.object_type_calc">
          <RealEstateObjectPopup
            :current-analog-popup-object="currentAnalogPopupObject"
            :image-css-prop="imageCssProp"
            :to-show-loader="isObjectLoading"
            :mode="''"
            :full-loader="true"
          />
        </template>
      </Teleport>
    </template>
  </template>
</template>

<script setup>
import _isEmpty from 'lodash/isEmpty'
import * as turf from '@turf/turf'
import maplibre from 'maplibre-gl'
import RealtyObjectPopup from './RealtyObjectPopup.vue'
import RealEstateObjectPopup from './RealEstateObjectPopup.vue'
import GeoObjectPopup from './GeoObjectPopup.vue'
import { api_unversal_realty } from '~/app_constants/api'
import { boundsStr, boundsInBounds, setToRange, pointInBox } from '~/components/MapComponent/Common'

const { $mapStore, $baseURL } = useNuxtApp()

const props = defineProps({
  // объект карты maplibre
  map: { type: Object, required: true },
  // объект гео-слоя
  layerItem: { type: Object, required: true },
  // границы видимости карты
  bounds: { type: Object, required: true },
  //circle: { type: Object },
  //box: { type: Object },
  //mapMode: { type: String, required: true },
})

const visible = ref(false)
let objects = []
let rasterLayer = false // содержит ли слой объект с растром
let circleRadius = 0
let colors = ['#51bbd6', '#f1f075', '#f28cb1']
// Переменные для многопоточной постраничной загрузки объектов слоя
let objCountTotal = null // общее число объектов в слое (получается с сервера)
let objectsCountForce = 0 // искусственное ограничение числа объектов в обход objCountTotal (для целей тестирования, 0 по умолчанию)
let loadLimitMax = 5000 // максимальное число объектов на страницу
let loadLimitMin = 1000 // минимальное число объетов на страницу
let loadLimit = 0 // рассчитанное число объектов для загрузки на странице
let loadedPages = 0 // число загруженных страниц с объектами
let loadThreads = 0 // число потоков запущенных для загрузки объектов
let loadThreadsMax = 1 // число потоков
let loadBlock = 10 // число страниц, оптимальное для загрузки (меняется, если не согласуется с loadLimitMin и loadLimitMax)
let totalPages = 0 // число страниц для загрузки (получается с сервера)
let loadController = null // токен http для отмены загрузки
let loadBounds = null // границы карты для которой происходит загрузка объектов
// Названия для источника и слоёв maplibre
let sourceName = ''
let circleLayerName = ''
let imageLayerName = ''
let polygonLayerName = ''
let polygonBorderLayerName = ''
let rasterLayerName = ''
let lineLayerName = ''
let captionLayerName = ''
let clusterLayerName = ''
let clusterCountLayerName = ''
let imgSourceName = ''

let filterStr = ''

let mousePoint = {}
let hoveredStateId = null

let loadTime = 0 // Время последней загрузки (мсек)

// Данияр: резльтаты из базы по страницам
let pagedResults = {}
let allSourceFeatures = []

onMounted(() => {
  // Названия для источников и слоёв maplibre
  sourceName = 'geoLayer_' + id() + '_geo_source'
  circleLayerName = 'geoLayer_' + id() + '_points'
  imageLayerName = 'geoLayer_' + id() + '_image'
  polygonLayerName = 'geoLayer_' + id() + '_polygons'
  polygonBorderLayerName = 'geoLayer_' + id() + '_polygon_borders'
  rasterLayerName = 'geoLayer_' + id() + '_rasters'
  lineLayerName = 'geoLayer_' + id() + '_lines'
  captionLayerName = 'geoLayer_' + id() + '_captions'
  clusterLayerName = 'geoLayer_' + id() + '_cluster'
  clusterCountLayerName = 'geoLayer_' + id() + '_cluster_count'

  $mapStore.setLayerItemProperty({ id: id(), prop: 'objCount', value: null })

  visible.value = true

  loadObjectsData()
})
onBeforeUnmount(() => {
  props.map.off('click', circleLayerName, addSingleObjectPopup)
  props.map.off('click', polygonLayerName, addGeoObjecPolygonPopup)
  props.map.off('click', lineLayerName, addUniversalPopup)
})

onUnmounted(() => {
  // Отмена предыдущей сессии с загрузкой объектов в потоках
  clearOpenedPopupInfo()
  if (loadController) {
    loadController.abort('layer was hidden')
  }
  $mapStore.setLayerItemFinished(id())
  removeSourceAndLayers()
  visible.value = false
})

watch(
  () => props.bounds,
  () => {
    loadObjectsData(false)
  },
)

// Короткая форма получения id слоя
const id = () => {
  return props.layerItem.id
}
// Короткая форма получения типа слоя
const layerType = () => {
  return props.layerItem.data.layer_type
}
const layerStyle = () => {
  return props.layerItem.data.style
}
// URL для загрузки объектов в зависимости от типа слоя
const objectsURL = () => {
  let url = null
  if (layerType() === 'A') {
    url = 'api/v1/realty/all/?' + filterStr
  } else if (layerType() === 'G') {
    url = 'api/v1/layers/geo_object/?' + filterStr
  }
  return url
}

// const getObjectsCount = async (inBounds) => {
//   let url = objectsURL() + '&limit=1'
//   if (inBounds) {
//     url += '&in_bbox=' + boundsStr(props.bounds)
//   }
//   var paged = await $http
//     .get(url)
//     .then((res) => res._data)
//     .catch((error) => {
//       console.log(error)
//     })
//   if (paged && paged.rows_filtered) {
//     return { objCountInBounds: paged.rows_filtered, objCountTotal: paged.total_count }
//   } else {
//     return { objCountInBounds: 0, objCountTotal: 0 }
//   }
// }

// Получение объектов для текущего слоя в границах экрана
const loadObjectsData = async (clearPopups = true) => {
  filterStr = 'geo_layer=' + id()
  // Если границы карты попадают в границы предыдущего и слой уже загружен
  const status = $mapStore.layersTreeItem(id()).status
  if (loadBounds && boundsInBounds(props.bounds, loadBounds) && status === null) return

  loadBounds = props.bounds

  objects = []

  // Отмена предыдущей сессии с загрузкой объектов в потоках
  if (loadController) {
    loadController.abort('started new loading session')
  }
  loadController = new AbortController()
  // limit устанавливаем фиксированно на 1000, т.к. избавились от запроса для получения предварительных данных
  loadLimit = loadLimitMin
  // Сбрасываем процент загрузки слоя
  $mapStore.setLayerItemProperty({ id: id(), prop: 'percentLoaded', value: 0 })
  loadedPages = 0
  loadPagedObjectsData(loadedPages, true, clearPopups)
}

// Загрузка объектов указанной партии (страницы)
const loadPagedObjectsData = async (page, inBounds, clearPopups = true) => {
  console.log(
    'стр. ' + page + ' загружается. Слой: ' + id() + ', лимит: ' + loadLimit + ', границы: ' + boundsStr(loadBounds),
  )
  // Выходим, если изменилась область видимости или слой скрыт
  if (!(boundsInBounds(props.bounds, loadBounds) && visible.value)) return
  // Помечаем, что слой загружается
  $mapStore.setLayerItemLoading(id())
  page = page || 1

  let loadLink = objectsURL()
  loadLink = loadLink + '&limit=' + loadLimit + '&page=' + page
  if (inBounds) {
    loadLink += '&in_bbox=' + boundsStr(loadBounds)
  }

  let paged = {}
  const startTime = performance.now()

  paged = await $http
    .get(loadLink, { signal: loadController.signal })
    .then((res) => res._data)
    .catch((error) => {
      if (error.name === 'CanceledError') {
        console.log('Отмена загрузки. Слой: ' + id() + ', страница: ' + page, error)
      } else {
        console.log(error)
      }
    })
  if (page === 1) {
    // общее количество получаем от запросов
    $mapStore.setLayerItemProperty({ id: id(), prop: 'objCount', value: paged.total_count })
    // количество страниц тоже получаем из запросов
    totalPages = paged && paged.total_pages
    loadThreads = totalPages > loadThreadsMax ? loadThreadsMax : totalPages
  }

  const endTime = performance.now()
  // Если к окончанию загрузки слой ещё отображается
  console.log(
    'стр. ' +
      page +
      ' готова. Слой: ' +
      id() +
      ', время:' +
      Math.round(endTime - startTime) +
      ' мсек ' +
      paged.total_pages,
  )

  if (visible.value) {
    // добавляем в переменную загруженные записи
    if (Object.keys(paged).length) {
      if (paged.results) {
        // Данияр: здесь был момент с задвоением данных, т.к. перед concat не обнулялись данные и иногда массивы входили дважды
        // Постарался сохранить логику с постраничным получением результатов через отдельный объект, куда записывается
        // результат для каждой страницы, а затем идет concat по всем страницам
        // Самое большое изменение - обнуление this.objects в concatObjectsPaged()
        pagedResults[page] = paged.results
        // this.concatObjects(paged.results)
        concatObjectsPaged()
      }
      loadedPages++
      $mapStore.setLayerItemProperty({
        id: id(),
        prop: 'percentLoaded',
        value: (page / totalPages) * 100,
      })
    }
    // Проверяем, есть ли ещё страницы для загрузки, учитывая те, что загружаются в других потоках
    if (paged && totalPages >= page + loadThreads) {
      loadPagedObjectsData(page + loadThreads, inBounds)
    }
  }
  // Если объекты не загружены, то убираем сопутствующие слои карты

  if (!objects) {
    removeSourceAndLayers()
  }
  // Иначе обновляем слои карты
  else if (visible.value) {
    colors = ['#51bbd6', '#f1f075', '#f28cb1']
    circleRadius = 0

    // Проверяем, является ли слой растровым (содержит один объект с растром)
    if (objects.length === 1 && objects[0].file_image !== null) {
      rasterLayer = true
    }
    // console.log(this.objects)
    addSourceAndLayers(clearPopups)
  }
  // Если загружены все партии
  if ((paged && totalPages === page) || !visible.value) {
    onLoadingComplete()
  }
}

// Когда завершена загрузка всех партий (страниц)
const onLoadingComplete = () => {
  // Снимаем пометку о загрузке
  $mapStore.setLayerItemFinished(id())
  loadController = null
  console.log('Загрузка завершена. Слой: ' + id())
}

const concatObjects = (newObjects) => {
  objects = objects.concat(newObjects)
}

const concatObjectsPaged = () => {
  objects = []
  for (const key in pagedResults) {
    objects = objects.concat(pagedResults[key])
  }
  // this.objects = this.objects.concat(this.pagedResults[page])
}

// Возвращает стиль из описания слоя. Если какие-то значения отсутствуют, возвращаются значения по умолчанию
const getLayerStyle = () => {
  const style = {
    fillColor: '#0000FF',
    fillOpacity: 0.25,
    fillOpacityHover: 0.55,
    lineColor: '#0000FF',
    lineWidth: 0,
    lineDasharray: 0,
    textColor: '#000000',
    textSize: 10,
    textField: '',
  }
  // const fillPattern = this.layerItem.data.style ? this.layerItem.data.style.fill_pattern : '#fff'
  if (props.layerItem.data.style && props.layerItem.data.style.fill_color)
    style.fillColor = props.layerItem.data.style.fill_color
  else if (props.layerItem.data.color) style.fillColor = props.layerItem.data.color

  if (props.layerItem.data.style && props.layerItem.data.style.fill_opacity)
    style.fillOpacity = 1 - props.layerItem.data.style.fill_opacity

  if (props.layerItem.data.style && props.layerItem.data.style.fill_opacity)
    style.fillOpacityHover = 1.3 - props.layerItem.data.style.fill_opacity

  if (props.layerItem.data.style && props.layerItem.data.style.line_color)
    style.lineColor = props.layerItem.data.style.line_color
  else if (props.layerItem.data.color) style.lineColor = props.layerItem.data.color

  if (props.layerItem.data.style && props.layerItem.data.style.line_width)
    style.lineWidth = props.layerItem.data.style.line_width

  if (props.layerItem.data.style && props.layerItem.data.style.line_dasharray)
    style.lineDasharray = props.layerItem.data.style.line_dasharray

  if (props.layerItem.data.style && props.layerItem.data.style.text_color)
    style.textColor = props.layerItem.data.style.text_color

  if (props.layerItem.data.style && props.layerItem.data.style.text_size)
    style.textSize = props.layerItem.data.style.text_size

  if (props.layerItem.data.style && props.layerItem.data.style.text_field)
    style.textField = props.layerItem.data.style.text_field

  return style
}

// Возвращает оформленный в html код попапа для указанного объекта
const getObjectPopup = (_object) => {
  if (_object.object_type_calc === 'OA') {
    return
    ;(_object.exchange_type === 'M'
      ? this.$main.realtyFields.ads_updated.label + ': ' + this.dateFormatter(_object.ads_updated)
      : this.$main.realtyFields.date_trade.label + ': ' + this.dateFormatter(_object.date_trade)) +
      '<br/>' +
      this.$main.realtyFields.ads_type.label +
      ': ' +
      this.findChoiceByValue('ads_type', _object.ads_type) +
      '<br/>' +
      this.$main.realtyFields.exchange_type.label +
      ': ' +
      this.findChoiceByValue('exchange_type', _object.exchange_type) +
      '<br/>' +
      this.$main.realtyFields.object_area.label +
      ': ' +
      _object.object_area +
      '<br/>' +
      this.$main.realtyFields.price_sale_per_m.label +
      ': ' +
      _object.price_sale_per_m +
      '<br/>' +
      this.$main.realtyFields.address_region.label +
      ': ' +
      this.$appObjects.getRegionById(_object.address_region)?.name +
      '<br/>' +
      this.$main.realtyFields.address_raw.label +
      ': ' +
      _object.address_raw
  } else {
    return
    this.$main.realtyFields.date_calc.label +
      ': ' +
      this.dateFormatter(_object.date_calc) +
      '<br/>' +
      this.$main.realtyFields.object_area.label +
      ': ' +
      _object.object_area +
      '<br/>' +
      this.$main.realtyFields.price_sale_per_m.label +
      ': ' +
      _object.price_sale_per_m +
      '<br/>' +
      this.$main.realtyFields.address_region.label +
      ': ' +
      this.$appObjects.getRegionById(_object.address_region)?.name +
      '<br/>' +
      this.$main.realtyFields.address_raw.label +
      ': ' +
      _object.address_raw
  }
}

// Добавляет источники MapLibre и слои для них
const addSourceAndLayers = (toClearPopups = true) => {
  // Временный коммент чтобы пронаблюдать за багом
  // if (toClearPopups) {
  //   clearOpenedPopupInfo()
  // }
  const boundaryObjects = []
  const style = getLayerStyle()

  // Для слоя с объявлениями
  if (props.layerItem.data.layer_type === 'A') {
    for (let i = 0; i < objects.length; i++) {
      let _object = objects[i]
      let _visible = true

      const boundaryObject = {
        id: _object.id,
        type: 'Feature',
        properties: {
          label: $mapStore.objectTypesGV?.[_object?.object_type]?.display_name || '',
          popup: getObjectPopup(_object),
          type: _object.geo_pos.type,
          object_type: _object.object_type,
          lng: _object.geo_pos.coordinates[0],
          lat: _object.geo_pos.coordinates[1],
          id: _object.id,
          index: i,
          visible: _visible,
          layer_type: 'A',
        },
        geometry: _object.geo_pos,
      }
      if (_object.object_type_calc === 'OO') {
        boundaryObject.properties.icon = 'aim-marker'
      }
      boundaryObjects.push(boundaryObject)
    }

    const boundaryObjectsSource = props.map.getSource(sourceName)
    allSourceFeatures = boundaryObjects
    if (boundaryObjectsSource) {
      // Данияр: Здесь возможно относительно костыльное решение задвоенных даных через фильтрацию boundaryObjects дублирующихся объектов
      // Вся остальная логика для this.objects работает (видимо) и с дубликатами, здесь просто передаются данные для кластера MapLibre
      // Так что такая правка более безопасна для остальной логики компонента, но не самое эффективное решение в целом
      // console.log('addSourceAndLayers boundaryObjectsSource', boundaryObjectsSource, boundaryObjects)
      boundaryObjectsSource.setData({
        type: 'FeatureCollection',
        features: boundaryObjects,
      })
    } else {
      // props.map.loadImage('/img/balance-scale-left-solid-16.png', function (error, image) {
      //   if (error) throw error
      //   if (!props.map.hasImage('aim-marker')) props.map.addImage('aim-marker', image)
      // })

      props.map.addSource(sourceName, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: boundaryObjects,
        },
        cluster: true,

        clusterMaxZoom: 20, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
      })

      props.map.addLayer({
        id: circleLayerName,
        type: 'circle',
        source: sourceName,
        filter: ['all', ['get', 'visible'], ['!', ['has', 'point_count']]],
        paint: {
          'circle-radius': 5 + circleRadius,
          'circle-color': ['case', ['has', 'icon'], style.fillColor, '#fff'],
          'circle-stroke-width': ['case', ['has', 'icon'], 8, 5],
          'circle-stroke-color': style.fillColor,
        },
      })

      props.map.addLayer({
        id: imageLayerName,
        type: 'symbol',
        source: sourceName,
        // filter: ['all', ['has', 'icon'], ['!', ['has', 'point_count']]],
        layout: {
          'icon-image': ['get', 'icon'],
          'icon-offset': [0, -1],
        },
      })

      props.map.addLayer({
        id: clusterLayerName,
        type: 'circle',
        source: sourceName,
        filter: ['has', 'point_count'],
        paint: {
          // три уровня отрисовки кругов:
          //   1, 20px когда число объектов в секторе до 100
          //   2, 30px когда число объектов в секторе от 100 до 750
          //   3, 40px когда число объектов в секторе от 750
          'circle-color': ['step', ['get', 'point_count'], style.fillColor, 100, style.fillColor, 750, style.fillColor],
          'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
        },
      })

      props.map.addLayer({
        id: clusterCountLayerName,
        type: 'symbol',
        source: sourceName,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
      })

      // props.map.on('mouseenter', circleLayerName, onObjectMouseEnter)
      // props.map.on('mouseleave', circleLayerName, onObjectMouseLeave)

      // props.map.on('click', circleLayerName, function (e) {
      //   // Данияр: чтобы не потерять откуда начинается открытие по иконке с карты
      //   console.log('GeoLayer.vue open by icon from map')
      //   selectedMapObject = {
      //     id: e.features[0].id,
      //     object_type: e.features[0].properties.object_type,
      //   }
      // })

      // Приближение карты по двойному клику на кластере
      props.map.on('dblclick', clusterLayerName, function (e) {
        var features = props.map.queryRenderedFeatures(e.point, {
          layers: [clusterLayerName],
        })

        var clusterId = features[0].properties.cluster_id
        zoomToCluster(clusterId, e.lngLat)
      })

      props.map.on('click', clusterLayerName, function (e) {
        if (e.originalEvent.cancelBubble) {
          return
        }
        e.originalEvent.cancelBubble = true
        var features = props.map.queryRenderedFeatures(e.point, {
          layers: [clusterLayerName],
        })

        addClusterPopup(features[0].properties, e.lngLat)
      })
      props.map.on('data', (e) => {
        if (!e.isSourceLoaded) return

        props.map.on('move', updateMarkers)
        props.map.on('moveend', updateMarkers)
        updateMarkers()
      })

      props.map.on('mouseenter', clusterLayerName, function () {
        this.getCanvas().style.cursor = 'pointer'
      })

      props.map.on('mouseleave', clusterLayerName, function () {
        this.getCanvas().style.cursor = ''
      })
    }
  }
  // Для слоя с гео-объектами
  else if (props.layerItem.data.layer_type === 'G') {
    // Если слой растровый, то создаём растровый ресурс и слой maplibre
    if (rasterLayer && objects[0].geo_pos.coordinates[0][0]) {
      const rasterObj = objects[0]
      const imageBounds = rasterObj.geo_pos.coordinates[0][0].slice(0, 4)
      const sourceData = {
        type: 'image',
        url: baseURL + rasterObj.file_image.url,
        coordinates: imageBounds,
      }
      const source = props.map.getSource(sourceName)
      // Если источник уже был создан, то обновляем данные
      if (source) {
        // console.log(source)
        source.updateImage(sourceData)
      } else {
        props.map.addSource(sourceName, sourceData)

        props.map.addLayer({
          id: rasterLayerName,
          source: sourceName,
          type: 'raster',
          paint: {
            'raster-opacity': 0.85,
          },
          filter: ['get', 'image'],
        })
      }
    }
    // Если слой не растровый, а geoJSON
    else {
      const sourceData = []
      for (const _object of objects) {
        const objProps = getObjectProps(_object, style.fillColor, style.fillOpacity, style.lineColor)
        sourceData.push({
          id: _object.id,
          type: 'Feature',
          properties: objProps,
          geometry: _object.geo_pos,
        })
      }
      const source = props.map.getSource(sourceName)
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: sourceData,
        })
      } else {
        props.map.addSource(sourceName, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: sourceData,
          },
        })

        props.map.addLayer({
          id: lineLayerName,
          type: 'line',
          source: sourceName,
          paint: {
            'line-color': style.lineColor,
            'line-width': 2,
          },
          filter: ['==', '$type', 'LineString'],
        })

        props.map.addLayer({
          id: captionLayerName,
          type: 'symbol',
          source: sourceName,
          layout: {
            'text-field': ['get', style.textField],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': style.textSize,
          },
          paint: {
            'text-color': style.textColor,
          },
          filter: ['==', '$type', 'Polygon'],
        })

        if (id() === 'searchOSM') {
          props.map.addLayer({
            id: circleLayerName,
            type: 'circle',
            source: sourceName,
            paint: {
              'circle-radius': 5,
              'circle-color': '#fff',
              'circle-stroke-width': 5,
              'circle-stroke-color': ['get', 'color'],
            },
            filter: ['==', '$type', 'Point'],
          })
        } else {
          props.map.addLayer({
            id: circleLayerName,
            type: 'circle',
            source: sourceName,
            paint: {
              'circle-radius': 5,
              'circle-color': '#fff',
              'circle-stroke-width': 5,
              'circle-stroke-color': style.fillColor,
            },
            filter: ['==', '$type', 'Point'],
          })
        }

        props.map.addLayer({
          id: polygonBorderLayerName,
          type: 'line',
          source: sourceName,
          paint: {
            'line-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#000', style.lineColor],
            'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 1, style.lineWidth],
            'line-dasharray': [1 + style.lineDasharray + style.lineDasharray / 2, style.lineDasharray],
          },
          filter: ['==', '$type', 'Polygon'],
        })

        const layers = props.map.getStyle().layers
        var layerBeforeId
        for (var i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol' || layers[i].type === 'circle') {
            layerBeforeId = layers[i].id
            break
          }
        }

        props.map.addLayer(
          {
            id: polygonLayerName,
            type: 'fill',
            source: sourceName,
            paint: {
              'fill-color': style.fillColor,
              'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                style.fillOpacityHover,
                style.fillOpacity,
              ],
            },
            filter: ['==', '$type', 'Polygon'],
          },
          layerBeforeId,
        )

        // this.map.on('click', this.polygonLayerName,  function(e) {
        //     this.$EventBus.emit('showGeoObjectInfo', { id: e.features[0].id, properties: e.features[0].properties })
        // });

        // props.map.on('click', polygonLayerName, getGeoObjectClick)
        // props.map.on('contextmenu', polygonLayerName, getGeoObject)
        // props.map.on('contextmenu', circleLayerName, getGeoObject)
      }
    }
  }

  // props.map.on('mouseenter', circleLayerName, onObjectMouseEnter)
  // props.map.on('mouseleave', circleLayerName, onObjectMouseLeave)
  props.map.on('click', circleLayerName, addSingleObjectPopup)

  props.map.on('click', polygonLayerName, addGeoObjecPolygonPopup)
  props.map.on('click', lineLayerName, addUniversalPopup)
  props.map.on('mouseenter', polygonLayerName, onObjectMouseEnter)
  props.map.on('mousemove', polygonLayerName, onObjectMouseMove)
  props.map.on('mouseleave', polygonLayerName, onObjectMouseLeave)

  props.map.on('mouseenter', lineLayerName, function () {
    this.getCanvas().style.cursor = 'pointer'
  })

  props.map.on('mouseleave', lineLayerName, function () {
    this.getCanvas().style.cursor = ''
  })
}

// Удаление ресурсов и слоёв MapLibre
const removeSourceAndLayers = () => {
  clearOpenedPopupInfo()

  if (props.map.getLayer(circleLayerName)) {
    props.map.removeLayer(circleLayerName)
  }
  if (props.map.getLayer(imageLayerName)) {
    props.map.removeLayer(imageLayerName)
  }
  if (props.map.getLayer(polygonLayerName)) {
    props.map.removeLayer(polygonLayerName)
  }
  if (props.map.getLayer(polygonBorderLayerName)) {
    props.map.removeLayer(polygonBorderLayerName)
  }
  if (props.map.getLayer(rasterLayerName)) {
    props.map.removeLayer(rasterLayerName)
  }
  if (props.map.getLayer(lineLayerName)) {
    props.map.removeLayer(lineLayerName)
  }
  if (props.map.getLayer(captionLayerName)) {
    props.map.removeLayer(captionLayerName)
  }
  if (props.map.getLayer(clusterLayerName)) {
    props.map.removeLayer(clusterLayerName)
  }
  if (props.map.getLayer(clusterCountLayerName)) {
    props.map.removeLayer(clusterCountLayerName)
  }
  // if (props.map.getLayer('highlight-selected-geo-object-in-' + polygonLayerName)) {
  //     props.map.removeLayer('highlight-selected-geo-object-in-' + polygonLayerName);
  // }
  if (props.map.getSource(sourceName)) {
    props.map.removeSource(sourceName)
  }
  if (props.map.getSource(imgSourceName)) {
    props.map.removeSource(imgSourceName)
  }
}

// Возвращает хэш с данными гео-объекта для формирования всплывающей подсказки на карте
const getObjectProps = (obj, fillColor, fillOpacity, lineColor) => {
  const objInfo = []
  const objProp = {}
  let objInfoLength = 0
  let objInfoStr = ''
  let addToPopup = 1
  const fields = []
  for (const key in obj.obj_misc) {
    if (addToPopup) {
      // if (obj.obj_misc[key]) {
      objInfoStr = key + ': ' + obj.obj_misc[key]
      objInfo.push(objInfoStr)
      objInfoLength = objInfoLength + objInfoStr.length
      if (objInfoLength > 100) addToPopup = 0
      // }
    }
    objProp[key] = obj.obj_misc[key]
    fields.push(key)
  }
  objProp.fields = fields
  objProp.geo_object_name = obj.name
  const htmlInfo = objInfo.join('<br>')

  objProp.popup = htmlInfo
  objProp.label = obj.name
  objProp.type = obj.geo_pos.type
  objProp.geo_coords = obj.geo_pos.coordinates
  objProp.image = obj.file_image != null
  objProp.fillColor = fillColor
  objProp.fillOpacity = fillOpacity
  objProp.lineColor = lineColor
  objProp.obj_misc = JSON.stringify(obj.obj_misc)
  objProp.layer_type = 'G'
  return objProp
}

const onObjectMouseEnter = (e) => {
  props.map.getCanvas().style.cursor = 'pointer'
  setPolygonHoverState(e)
}

const onObjectMouseMove = (e) => {
  setPolygonHoverState(e)
}

const onObjectMouseLeave = () => {
  if (hoveredStateId) {
    props.map.setFeatureState({ source: sourceName, id: hoveredStateId }, { hover: false })
  }
  hoveredStateId = null
  // setHoveredCurrentFeatures(true)
  props.map.getCanvas().style.cursor = ''
  props.map.popup.remove()
}

const updateHoverObject = (e) => {
  var coordinates
  if (e.features[0].properties.type === 'Polygon' || e.features[0].properties.type === 'MultiPolygon') {
    coordinates = e.lngLat
  } else if (e.features[0].properties.type === 'Point') {
    coordinates = e.features[0].geometry.coordinates.slice()
  }

  const allObjects = allFeaturesUnderMouse(e)

  // Уточнение координат при масштабировании
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
  }

  if (e.features.length > 0) {
    if (hoveredStateId) {
      props.map.setFeatureState({ source: sourceName, id: hoveredStateId }, { hover: false })
    }
    hoveredStateId = e.features[0].id
    props.map.setFeatureState({ source: sourceName, id: hoveredStateId }, { hover: true })
  }

  let iconColor, iconGlyph
  if (props.layerItem.data.style) {
    iconColor = props.layerItem.data.style.fill_color || '#fff'
    iconGlyph = props.layerItem.data.style.glyph_name
  } else {
    iconColor = props.layerItem.data.color || '#fff'
    iconGlyph = props.layerItem.data.glyph_name
  }
  const icon = `<i class="${iconGlyph}" style="font-size: 1.2em; color:${iconColor}"></i> `
  let caption = 'Слой: ' + (props.layerItem.data.caption || props.layerItem.data.name) + '<br>'
  if ((props.layerItem.data.caption || props.layerItem.data.name) === 'geoObjectsClick') caption = ''
  var allPopups = ''
  if (allObjects && allObjects.length > 0) {
    allPopups = allPopups + '<table><tr>'
    allObjects.forEach((obj) => {
      allPopups =
        allPopups +
        '<td style="max-width: fit-content">' +
        'Объект: <strong>' +
        obj.title +
        '</strong><br/>' +
        obj.popup +
        '</td>'
    })
    allPopups = allPopups + '</tr></table>'
  }
  const title =
    icon +
    caption +
    // 'Объект: <strong>' +
    // e.features[0].properties.label +
    // '</strong><br/>' +
    // (e.features[0].properties.popup || '')
    allPopups
  props.map.popup
    .setLngLat(coordinates)
    // .trackPointer()
    // .setHTML('<div style="opacity: 0.3; ">' + title + '</div>')
    .setHTML(title)
    .addTo(props.map)
}

const allFeaturesUnderMouse = (e) => {
  const d = 0
  const features = props.map.queryRenderedFeatures([
    { x: e.point.x - d, y: e.point.y - d },
    { x: e.point.x + d, y: e.point.y + d },
  ])

  let uniqueFeatures = []
  if (features) uniqueFeatures = getUniqueFeatures(features)
  matchingPopupTypes = {}
  uniqueFeatures.forEach((item) => {
    const id = item.properties.layer_type === 'A' ? item.properties.id : item.id
    matchingPopupTypes[id] = item.properties.layer_type
  })

  // const allObjects = []
  // if (uniqueFeatures && uniqueFeatures.length > 0) {
  //   uniqueFeatures.forEach((feature) => {
  //     allObjects.push({
  //       title: feature.properties.label,
  //       popup: feature.properties.popup,
  //     })
  //   })
  // }
  return uniqueFeatures
}

const getUniqueFeatures = (features) => {
  const uniqueIds = new Set()
  const uniqueFeatures = []
  for (const feature of features) {
    const id = feature.id
    if (!uniqueIds.has(id)) {
      uniqueIds.add(id)
      uniqueFeatures.push(feature)
    }
  }
  return uniqueFeatures
}
async function zoomToCluster(cluster_id, coordinates) {
  const source = props.map.getSource(sourceName)

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

// Попапы
const currentAnalogPopupID = ref('')
let currentObjectID = null
const currentAnalogPopupObject = ref({})
const currentObjectInCluster = ref(0)
const popups = ref({})
const featuresIds = ref([])
let matchingPopupTypes = {}
async function addClusterPopup(propsObj, coordinates) {
  let clusterSource = props.map.getSource(sourceName)

  const features = await clusterSource.getClusterLeaves(propsObj.cluster_id, propsObj.point_count)

  featuresIds.value = features.map((item) => {
    matchingPopupTypes[item.id] = 'A'
    return item.id
  })

  const id = propsObj.cluster_id
  if (popups.value[id]) return
  popupMode.value = 'A'
  const html = `<div id='customClusterPopup${-id}' class="custom-cluster-popup"></div>`
  const popup = new maplibre.Popup()
  popups.value[-id] = popup
  popup.on('close', () => {
    clearOpenedPopupInfo()
  })
  popup.setHTML(html).setMaxWidth('fit-content')

  markersOnScreen[id].setPopup(popup)
  markersOnScreen[id].togglePopup()
  currentAnalogPopupID.value = `customClusterPopup${-id}`
  currentObjectID = id

  // featuresIds.value = features.map((feature) => {
  //   const obj = props.items[feature.properties.index]
  //   return {
  //     ...feature,
  //     object: obj,
  //   }
  // })
  await setCurrentObjectInCluster(0)

  nextTick(() => {
    const scrollContainer = document.getElementById('objects-in-cluster-scrollbar')
    scrollContainer.addEventListener('wheel', (e) => {
      e.preventDefault()
      scrollContainer.scrollLeft += e.deltaY
    })
  })
}

import mime from 'mime'
import { api_geo_object } from '~/app_constants/api'
const controller = new AbortController()
const signal = controller.signal
const imageUrl = ref('')
const isObjectLoading = ref(false)
const popupMode = ref(null)
async function getObject(id) {
  isObjectLoading.value = true
  await $http
    .get(api_unversal_realty + id, { signal })
    .then((res) => {
      currentAnalogPopupObject.value = res._data
      const fileImageArr = res._data.files.filter((file) => isImage(file.name))
      if (fileImageArr.length) {
        imageUrl.value = $baseURL + fileImageArr[0].url
      } else imageUrl.value = ''

      isObjectLoading.value = false
    })
    .catch((error) => {
      if (error.name === 'AbortError') {
        console.log('Fetch request aborted')
      } else {
        console.error('Fetch request failed:', error)
      }
    })
}

async function getGeoObject(id) {
  isObjectLoading.value = true
  await $http
    .get(api_geo_object + id, { signal })
    .then((res) => {
      // currentAnalogPopupObject.value = res._data
      setGeoObject(res._data)
      isObjectLoading.value = false
    })
    .catch((error) => {
      if (error.name === 'AbortError') {
        console.log('Fetch request aborted')
      } else {
        console.error('Fetch request failed:', error)
      }
    })
}

function setGeoObject(properties) {
  currentAnalogPopupObject.value.label = properties.name
  currentAnalogPopupObject.value.obj_misc = properties.obj_misc
}
function isImage(name) {
  if (typeof mime.getType(name) === 'string') {
    return mime.getType(name).includes('image/')
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
function clearOpenedPopupInfo() {
  console.log('clearOpenedPopupInfo')
  controller.abort()
  popupMode.value = null
  clearPopups()

  setHoveredCurrentFeatures(false)
  isObjectLoading.value = false
  imageUrl.value = ''
  currentObjectID = null
  currentAnalogPopupID.value = ''
  currentAnalogPopupObject.value = {}
  featuresIds.value = []
  currentObjectInCluster.value = 0
}

async function setCurrentObjectInCluster(i) {
  if (i < 0 || i > featuresIds.value.length - 1 || isObjectLoading.value) return
  imageUrl.value = ''
  currentObjectInCluster.value = i

  if (matchingPopupTypes[featuresIds.value[i]] === 'A') {
    await getObject(featuresIds.value[i])
    popupMode.value = 'A'
  } else if (matchingPopupTypes[featuresIds.value[i]] === 'G') {
    await getGeoObject(featuresIds.value[i])
    popupMode.value = 'G'
    // currentObjectID = featuresIds.value[i]
    // props.map.setFeatureState({ source: sourceName, id: featuresIds.value[i] }, { hover: true })
  }
}

const markers = {}
let markersOnScreen = {}

function updateMarkers() {
  const newMarkers = {}

  let features = props.map.querySourceFeatures(sourceName)
  if (!features.length && props.map.getSource(sourceName)) {
    features = props.map.getSource(sourceName)._data.features
  }
  for (const feature of features) {
    const coords = feature.geometry.coordinates
    const properties = feature.properties
    if (properties.cluster) {
      const id = properties.cluster_id
      let marker = markers[id]
      if (!marker) {
        const html = '<div></div>'
        const el = document.createElement('div')
        el.innerHTML = html
        const element = el.firstChild

        marker = markers[id] = new maplibre.Marker({
          element: element,
        }).setLngLat(coords)
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

  markersOnScreen = newMarkers
}

async function addSingleObjectPopup(e) {
  if (e.originalEvent.cancelBubble) {
    return
  }
  e.originalEvent.cancelBubble = true
  var coordinates = e.features[0].geometry.coordinates.slice()

  var features = allFeaturesUnderMouse(e)
  const clusters = features.filter((item) => item.properties.cluster)
  if (clusters.length) return

  // Уточнение координат при масштабировании
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
  }
  const id = features[0].properties.layer_type === 'A' ? features[0].properties.id : features[0].id
  if (popups.value[id]) return
  else clearPopups()
  const popup = new maplibre.Popup()
  popups.value[id] = popup
  popup.on('close', () => {
    clearOpenedPopupInfo()
  })
  const title = `<div id='customAnalogPopup${id}' class="${features.length > 1 ? 'custom-cluster-popup' : 'custom-annalog-popup'} d-flex"></div>`
  if (features[0].properties.layer_type === 'A') {
    popupMode.value = 'A'
    if (features.length > 1) {
      featuresIds.value = features.map((item) => {
        return item.properties.layer_type === 'A' ? item.properties.id : item.id
      })

      await setCurrentObjectInCluster(0)
    } else await getObject(id)
  } else if (features[0].properties.layer_type === 'G') {
    popupMode.value = 'G'
    if (features.length > 1) {
      featuresIds.value = features.map((item) => {
        return item.properties.layer_type === 'A' ? item.properties.id : item.id
      })

      await setCurrentObjectInCluster(0)
    } else await getGeoObject(id)
  }
  popup.setLngLat(coordinates).setMaxWidth('fit-content').setHTML(title).addTo(props.map)
  currentAnalogPopupID.value = 'customAnalogPopup' + id
  currentObjectID = id

  if (features.length > 1) {
    nextTick(() => {
      const scrollContainer = document.getElementById('objects-in-cluster-scrollbar')
      scrollContainer.addEventListener('wheel', (e) => {
        e.preventDefault()
        scrollContainer.scrollLeft += e.deltaY
      })
    })
  }
}

async function addGeoObjecPolygonPopup(e) {
  if (e.originalEvent.cancelBubble) {
    return
  }
  e.originalEvent.cancelBubble = true
  var features = allFeaturesUnderMouse(e)
  console.log(e, e.features, features)
  const clusters = features.filter((item) => item.properties.cluster)
  if (clusters.length) return

  var coordinates
  if (features[0].properties.type === 'Polygon' || features[0].properties.type === 'MultiPolygon') {
    coordinates = e.lngLat
  } else if (features[0].properties.type === 'Point') {
    coordinates = features[0].geometry.coordinates.slice()
  }
  // Уточнение координат при масштабировании
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
  }

  const id = features[0].properties.layer_type === 'A' ? features[0].properties.id : features[0].id
  // if (features.length === 1 && features[0].properties.layer_type === 'G') {
  //   props.map.setFeatureState({ source: sourceName, id: id }, { hover: true })
  // }
  if (popups.value[id]) return
  else clearPopups()
  const popup = new maplibre.Popup()
  popups.value[id] = popup
  popup.on('close', () => {
    clearOpenedPopupInfo()
  })
  const title = `<div id='customAnalogPopup${id}' class="${features.length > 1 ? 'custom-cluster-popup' : 'custom-annalog-popup'} d-flex"></div>`
  if (features[0].properties.layer_type === 'A') {
    popupMode.value = 'A'
    if (features.length > 1) {
      featuresIds.value = features.map((item) => {
        return item.properties.layer_type === 'A' ? item.properties.id : item.id
      })

      await setCurrentObjectInCluster(0)
    } else await getObject(id)
  } else if (features[0].properties.layer_type === 'G') {
    popupMode.value = 'G'
    await nextTick()
    if (features.length > 1) {
      featuresIds.value = features.map((item) => {
        return item.properties.layer_type === 'A' ? item.properties.id : item.id
      })

      await setCurrentObjectInCluster(0)
    } else await getGeoObject(id)
  }
  popup.setLngLat(coordinates).setMaxWidth('fit-content').addTo(props.map)
  nextTick(() => {
    popup.setHTML(title)
  })
  currentAnalogPopupID.value = 'customAnalogPopup' + id

  currentObjectID = id
  // setHoveredCurrentFeatures(true)
  if (features.length > 1) {
    nextTick(() => {
      const scrollContainer = document.getElementById('objects-in-cluster-scrollbar')
      scrollContainer.addEventListener('wheel', (e) => {
        e.preventDefault()
        scrollContainer.scrollLeft += e.deltaY
      })
    })
  }
}

function setPolygonHoverState(e) {
  var features = e.features
  if (features.length > 0) {
    if (hoveredStateId) {
      props.map.setFeatureState({ source: sourceName, id: hoveredStateId }, { hover: false })
    }
    hoveredStateId = e.features[0].id
    props.map.setFeatureState({ source: sourceName, id: hoveredStateId }, { hover: true })
  }

  // setHoveredCurrentFeatures(true)
}

let hovered = false
function setHoveredCurrentFeatures(state) {
  if (state === hovered) return
  if (featuresIds.value.length > 0) {
    featuresIds.value.forEach((item) => {
      props.map.setFeatureState({ source: sourceName, id: item }, { hover: state })
    })
  }
  if (currentObjectID) {
    props.map.setFeatureState({ source: sourceName, id: currentObjectID }, { hover: state })
  }
  hovered = state
}

function clearPopups() {
  console.log('clearPopus')
  for (const index in popups.value) {
    popups.value[index].remove()
  }
  popups.value = {}
}

async function addUniversalPopup(e) {
  if (e.originalEvent.cancelBubble) {
    return
  }
  e.originalEvent.cancelBubble = true

  var features = allFeaturesUnderMouse(e)
  const clusters = features.filter((item) => item.properties.cluster)
  if (clusters.length) return

  var coordinates = e.lngLat

  // Уточнение координат при масштабировании
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
  }

  const id = features[0].properties.layer_type === 'A' ? features[0].properties.id : features[0].id

  if (popups.value[id]) return
  else clearPopups()
  const popup = new maplibre.Popup()
  popups.value[id] = popup
  popup.on('close', () => {
    clearOpenedPopupInfo()
  })
  const title = `<div id='customAnalogPopup${id}' class="${features.length > 1 ? 'custom-cluster-popup' : 'custom-annalog-popup'} d-flex"></div>`
  if (features[0].properties.layer_type === 'A') {
    popupMode.value = 'A'
    if (features.length > 1) {
      featuresIds.value = features.map((item) => {
        return item.properties.layer_type === 'A' ? item.properties.id : item.id
      })

      await setCurrentObjectInCluster(0)
    } else await getObject(id)
  } else if (features[0].properties.layer_type === 'G') {
    popupMode.value = 'G'
    if (features.length > 1) {
      featuresIds.value = features.map((item) => {
        return item.properties.layer_type === 'A' ? item.properties.id : item.id
      })

      await setCurrentObjectInCluster(0)
    } else await getGeoObject(id)
  }
  popup.setLngLat(coordinates).setMaxWidth('fit-content').setHTML(title).addTo(props.map)
  currentAnalogPopupID.value = 'customAnalogPopup' + id
  currentObjectID = id
  // setHoveredCurrentFeatures(true)
  if (features.length > 1) {
    nextTick(() => {
      const scrollContainer = document.getElementById('objects-in-cluster-scrollbar')
      scrollContainer.addEventListener('wheel', (e) => {
        e.preventDefault()
        scrollContainer.scrollLeft += e.deltaY
      })
    })
  }
}
</script>
