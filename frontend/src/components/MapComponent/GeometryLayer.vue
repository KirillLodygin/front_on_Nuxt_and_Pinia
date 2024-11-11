<!-- 
  Слой для вывода на карте любой геометрии в формате GeoJSON.
  Стиль передаётся через раздел property: {
    style: 'primary' || 'purple', // название стиля
    ...
  }
  Используется внутри тэга MapComponent
-->
<script lang="ts" setup>
import type { Map } from 'maplibre-gl'
import maplibre from 'maplibre-gl'

const props = defineProps({
  // Объект карты MapLibre-gl
  map: { type: Object as PropType<Map>, required: true },
  // Массив с объектами в формате geoJSON
  geometry: { type: Array as PropType<any[]>, required: true },
  // Массив с id выделенных объектов
  emphasis: { type: Array as PropType<number[]>, default: [] },
})

// Названия для источников и слоёв maplibre
const id = ref(0)
let sourceName: string = ''
let circleLayerName: string = ''
let polygonLayerName: string = ''

// Стили для вывода геометрии (название должно быть указано в properties.style)
const styles: any = {
  primary: { fill: 'rgba(36, 157, 240, .4)', fillEmphasis: 'rgba(36, 157, 240, .8)', stroke: 'rgba(36, 157, 240, 1)' },
  purple: { fill: 'rgba(200, 100, 240, .4)', fillEmphasis: 'rgba(200, 100, 240, .8)', stroke: 'rgba(200, 100, 240, 1)' },
}

onMounted(() => {
  const instance = getCurrentInstance()
  const name = 'geometry'
  if (instance) {
    id.value = instance.uid
    // Названия для источников и слоёв maplibre
    sourceName = name + '_' + id.value + '_source'
    circleLayerName = name + '_' + id.value + '_points'
    polygonLayerName = name + '_' + id.value + '_polygons'
  }
})

onUnmounted(() => {
  removeSourceAndLayers()
})

onUpdated(() => {})

watch(
  () => props.geometry,
  () => { addSourceAndLayers() },
)

watch(
  () => props.emphasis,
  (newValue, oldValue) => { updateEmphasis(newValue, oldValue) },
)

// Добавляет источники MapLibre и слои для них. 
// Если источник уже существует, то он обновляется
const addSourceAndLayers = async () => {
  const source: any = props.map.getSource(sourceName)
  if (source) {
    source.setData({
      type: 'FeatureCollection',
      features: props.geometry,
    })
  } 
  else {
    props.map.addSource(sourceName, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: props.geometry,
      },
    })
  }

  // Добавление слоёв для каждого из стилей
  for (const styleName in styles) {
    const style: any = styles[styleName]
    // Слой с точками
    if (!props.map.getLayer(circleLayerName + '_' + styleName)) {
      props.map.addLayer({
        id: circleLayerName + '_' + styleName,
        type: 'circle',
        source: sourceName,
        paint: {
            'circle-radius': 10,
            'circle-color': [
              'case',
              ['boolean', ['feature-state', 'emphasis'], false],
              style.fillEmphasis,
              style.fill 
            ],
            'circle-stroke-color': style.stroke,
        },
        filter: ['all', ['==', '$type', 'Point'], ['==', 'style', styleName]]
      })
    }

    // Слой с полигонами
    if (!props.map.getLayer(polygonLayerName + '_' + styleName)) {
      props.map.addLayer({
        id: polygonLayerName + '_' + styleName,
        type: 'fill',
        source: sourceName,
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'emphasis'], false],
            style.fillEmphasis,
            style.fill 
          ],
          'fill-outline-color': style.stroke,
        },
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'style', styleName]]
      })
    }
  }
}

const updateEmphasis = (newArr: number[], oldArr: number[]) => {
  oldArr.forEach((_id: number) => { 
    if (_id) {
      props.map.setFeatureState(
        { source: sourceName, id: _id },
        { emphasis: false }
      )
    }
  })

  newArr.forEach((_id: number) => { 
    if (_id) {
      props.map.setFeatureState(
        { source: sourceName, id: _id },
        { emphasis: true }
      )
    }
  })
}

// Удаление ресурсов и слоёв MapLibre
const removeSourceAndLayers = () => {
  if (!Object.keys(props.map).length) return

  for (const styleName in styles) {
    if (props.map.getLayer(circleLayerName + '_' + styleName)) {
      props.map.removeLayer(circleLayerName + '_' + styleName)
    }
    if (props.map.getLayer(polygonLayerName + '_' + styleName)) {
      props.map.removeLayer(polygonLayerName + '_' + styleName)
    }
  }

  if (props.map.getSource(sourceName)) {
    props.map.removeSource(sourceName)
  }
}

const render = () => {
  return ''
}
</script>
