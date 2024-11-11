import { defineStore } from 'pinia'
import _cloneDeep from 'lodash/cloneDeep'
import {
  api_constant,
  api_geo_layer,
  api_geo_layer_tree,
  api_geo_layers_ids_for_users,
  api_geo_object_upload,
  api_geo_objects_in_radius,
  api_get_realty_objects_in_coords,
  api_osm_layer_id,
  api_valhalla_request,
} from '~/app_constants/api'
import { getTreeItem } from '~/components/MapComponent/KsTreeTraversal'
import useUserPermissions from '~/composables/useUserPermissions'
import type {
  geoLayerTreeNodeNodeType,
  geoLayerTreeNodeType,
  locationPointType,
  visualizationDataType,
} from '~/types/treeTypes'
import { measureModeType } from '~/types/mapTypes'
import { removeEmptyFields } from '~/utils/removeEmptyFields'
import { routingModeCompliance } from '~/app_constants/mapInstrumentsData'
import type { IsochroneDataType, RouteDataType, ValhallaErrorResponseType } from '~/types/valhallaResponseTypes'
import type { Point } from 'geojson'

interface MapStoreState {
  mapMode: String
  measureMode: measureModeType
  measureReset: Boolean
  measureVisible: Boolean
  measureDistanceValue: number
  measureAreaValue: number
  measurePointFromCoords: { lng: number; lat: number } | null
  visibleLayersId: number[]
  ctxOSMObject: any
  selectedOSMObject: object
  saVariants: any[]
  saAutoScale: boolean
  goToAddress: object
  saActiveIndex: number
  selectedMapObject: object
  currentRealtyObject: Record<string, any>
  addObjectToComparisonFullscreen: boolean
  displayCompareObjectFullscreen: boolean
  isLayersViewReset: boolean
  isOpenLayersSettings: boolean
  geoLayerTree: geoLayerTreeNodeType[]
  isLayersLoading: boolean
  geoLayerTreePromise: Promise<geoLayerTreeNodeType[]> | null
  geoLayersIdsForUsers: Record<string, any>[]
  isGeoLayersIdsForUsersLoading: boolean
  geoLayersIdsForUsersPromise: Promise<Record<string, any>[]> | null
  osmLayerId: number | null
  isOsmLayerIdLoading: boolean
  osmLayerIdPromise: Promise<number> | null
  mapInstrumentPanelHeight: number
  geoLayerNode: geoLayerTreeNodeNodeType | null
  importObjectsModal: boolean
  layerRemoveModal: boolean
  layerClearModal: boolean
  styleSettingsModal: boolean
  styleSettingsParam: string
  fileLabelTextReset: boolean
  draggedId: number | null
  droppedId: number | null
  visualizationData: visualizationDataType
  routingTransportationMode: number
  firstRoutingAddress: string
  secondRoutingAddress: string
  firstRoutingCoords: locationPointType | null
  secondRoutingCoords: locationPointType | null
  // данные роутинга
  isStartPointFromMapActive: boolean
  isEndPointFromMapActive: boolean
  routingData: RouteDataType | ValhallaErrorResponseType | null
  abortGetMapRouteController: any
  abortGetAddressesController: any
  isRouteLoading: boolean
  isochronePointAddress: string
  isochronePointCoords: locationPointType | null
  isochroneContoursTime: number | null
  // данные изохрона
  isochroneData: IsochroneDataType | ValhallaErrorResponseType | null
  isochroneObjectsData: Record<string, any>[]
  abortGetIsochroneController: any
  isIsochroneLoading: boolean
  // работа с модалкой для отображения данных по осм, гео-слоям и гео-цофам
  toShowGeoInfoModal: boolean
  geoInfoOsmObj: Record<string, any>
  geoInfoPos: Point | null
  // объекты geoJSON для отрисовки в слое GeometryLayer
  // данные заполняются в компонентах выпадающего меню MapCtxMenu, WorkWithMapCtxMenu
  geometryToDraw: Record<string, any>[]
  // перечень id выделенных объектов (из массива geometryToDraw)
  geometryEmphasis: number[]
  mapInstrumentActiveTabIndex: number
  isIsochroneAddressFromCtx: boolean
  isRouteAdressFromCtx: boolean
  abortGetMapObjectController: any
  isIsochronePointFromMapActive: boolean
  isShortLayersView: boolean
  shortLayersViewIdsList: number[]
}

export default defineStore('mapStore', {
  state: () =>
    <MapStoreState>{
      mapMode: 'free',
      measureMode: measureModeType.distance,
      measureReset: false,
      measureVisible: true,
      measureDistanceValue: 0,
      measureAreaValue: 0,
      measurePointFromCoords: null,
      // Список идентификаторов видимых слоёв
      visibleLayersId: [],
      // Объект OSM под контекстным меню карты
      ctxOSMObject: {},
      selectedOSMObject: {},
      saVariants: [],
      saAutoScale: true,
      goToAddress: {},
      saActiveIndex: 0,
      selectedMapObject: {},
      currentRealtyObject: {},
      addObjectToComparisonFullscreen: false,
      displayCompareObjectFullscreen: false,
      isLayersViewReset: false,
      isOpenLayersSettings: false,
      // Список слоёв, отображаемых у пользователей
      geoLayersIdsForUsers: [],
      // Выполняется загрузка списка слоёв, отображаемых у пользователей
      isGeoLayersIdsForUsersLoading: false,
      geoLayersIdsForUsersPromise: null,
      osmLayerId: null,
      isOsmLayerIdLoading: false,
      osmLayerIdPromise: null,
      geoLayerTree: [],
      // Выполняется загрузка дерева слоёв с сервера
      isLayersLoading: false,
      geoLayerTreePromise: null,
      mapInstrumentPanelHeight: 400,
      geoLayerNode: null,
      importObjectsModal: false,
      layerRemoveModal: false,
      layerClearModal: false,
      styleSettingsModal: false,
      styleSettingsParam: 'main',
      fileLabelTextReset: false,
      draggedId: null,
      droppedId: null,
      visualizationData: {
        dataForMap: 'analogs_count',
        visualType: 'clusters',
        colorGradation: 'first',
        samplingPeriod: '2024-Q1',
        objectType: 'Q',
        adsType: 'R',
        funcPurpose: 'Офисное',
      },
      routingTransportationMode: 1,
      firstRoutingAddress: '',
      secondRoutingAddress: '',
      firstRoutingCoords: null,
      secondRoutingCoords: null,
      isStartPointFromMapActive: false,
      isEndPointFromMapActive: false,
      routingData: null,
      abortGetMapRouteController: null,
      abortGetAddressesController: null,
      isRouteLoading: false,
      isochronePointAddress: '',
      isochronePointCoords: null,
      isochroneContoursTime: null,
      isochroneData: null,
      isochroneObjectsData: [],
      abortGetIsochroneController: null,
      isIsochroneLoading: false,
      toShowGeoInfoModal: false,
      geoInfoOsmObj: {},
      geoInfoPos: null,
      geometryToDraw: [],
      geometryEmphasis: [],
      mapInstrumentActiveTabIndex: -1,
      isIsochroneAddressFromCtx: false,
      isRouteAdressFromCtx: false,
      abortGetMapObjectController: null,
      isIsochronePointFromMapActive: false,
      isShortLayersView: false,
      shortLayersViewIdsList: [2, 4, 34, 49, 5253],
    },
  getters: {},

  actions: {
    resetState() {
      this.$reset()
    },
    setMapMode(value: String) {
      this.mapMode = value
    },
    // setMeasureMode(value: measureModeType) {
    //   this.measureMode = value
    // },
    setCtxOSMObject(value: object) {
      this.ctxOSMObject = value
    },
    setSelectedOSMObject(value: object) {
      this.selectedOSMObject = value
    },
    setSaVariants(value: any[]) {
      this.saVariants = value
    },
    setSaAutoScale(value: boolean) {
      this.saAutoScale = value
    },
    async setGoToAddress(value: object) {
      this.goToAddress = {}
      await nextTick()
      this.goToAddress = value
    },
    setSaActiveIndex(value: number) {
      this.saActiveIndex = value
    },
    setSelectedMapObject(value: object) {
      this.selectedMapObject = _cloneDeep(value)
    },
    setCurrentRealtyObject(value: object) {
      this.currentRealtyObject = _cloneDeep(value)
    },
    resetLayersView() {
      this.hideGeoLayer(null)
      this.isLayersViewReset = true
      setTimeout(() => (this.isLayersViewReset = false), 100)
    },
    changeLayersView() {
      this.isShortLayersView = !this.isShortLayersView
    },
    switchLayersSettings(value: boolean) {
      this.isOpenLayersSettings = value
    },
    setMapInstrumentPanelHeight(value: number) {
      this.mapInstrumentPanelHeight = value
    },
    setGeoLayerNode(value: geoLayerTreeNodeNodeType | null) {
      this.geoLayerNode = _cloneDeep(value)
    },
    setImportObjectsModal(value: boolean) {
      if (!value) {
        this.fileLabelTextReset = true
      }
      this.importObjectsModal = value
    },
    setLayerRemoveModal(value: boolean) {
      this.layerRemoveModal = value
    },
    setLayerClearModal(value: boolean) {
      this.layerClearModal = value
    },
    setStyleSettingsModal(value: boolean) {
      this.styleSettingsModal = value
    },
    setStyleSettingsParam(value: string) {
      this.styleSettingsParam = value
    },
    startSettings(param: string) {
      this.styleSettingsParam = param
      this.styleSettingsModal = true
    },
    setFileLabelTextReset(value: boolean) {
      this.fileLabelTextReset = value
    },
    setDraggedId(value: number | null) {
      this.draggedId = value
    },
    setDroppedId(value: number | null) {
      this.droppedId = value
    },
    findParentId(tree: geoLayerTreeNodeType[], targetId: number | undefined, parentId: number = 0): number {
      for (const item of tree) {
        if (item.id === targetId) {
          return parentId
        }
        const foundParentId = this.findParentId(item.children || [], targetId, item.id)
        if (foundParentId !== 0) {
          return foundParentId
        }
      }
      return 0
    },
    async uploadFile(file: File | null, cleanBeforeImport: boolean = false, simplify: boolean = true) {
      console.log('cleanBeforeImport: ', cleanBeforeImport)
      console.log('simplify: ', simplify)
      const node = this.geoLayerNode
      if (file && node) {
        const body = new FormData()
        body.set('map_info_file', file)
        body.set('clean_before_import', cleanBeforeImport.toString())
        body.set('simplify', simplify.toString())
        body.set('tn_parent', this.findParentId(this.geoLayerTree, node.id).toString())
        if (node.name) {
          body.set('title', node.name)
        }
        if (node.layer_type) {
          body.set('layer_type', node.layer_type)
        }
        if (node.id) {
          body.set('id_layer', node.id.toString())
        }
        body.set('style', JSON.stringify({}))
        try {
          console.log(body)
          await $http.post(api_geo_object_upload, { body })
        } catch (err) {
          throw err
        }
      }
    },
    async getLayerTree(): Promise<geoLayerTreeNodeType[]> {
      if (this.geoLayerTree.length) {
        return this.geoLayerTree
      }
      if (this.isLayersLoading && this.geoLayerTreePromise) {
        return this.geoLayerTreePromise
      }
      this.isLayersLoading = true
      this.geoLayerTreePromise = $http
        .get(api_geo_layer_tree)
        .then(async (res: Record<string, any>) => {
          const { $auth } = useNuxtApp()
          const userPermissions: string[] = useUserPermissions($auth.user?.permissions)
          await this.getOsmLayerId()
          const geoLayersIdsForUsers = await this.getGeoLayersIdsForUsers()
          const data = userPermissions.includes('ADMIN')
            ? res._data
            : res._data.filter((el: Record<string, any>) => geoLayersIdsForUsers[0].value.includes(el.id))
          // const data = res._data.filter((el: Record<string, any>) => [4, 34, 5253].includes(el.id))
          this.geoLayerTree = data
          return data
        })
        .catch((err: any) => {
          console.error(err)
          return this.geoLayerTree
        })
        .finally(() => {
          this.isLayersLoading = false
          this.geoLayerTreePromise = null
        })
      return this.geoLayerTreePromise
    },
    layersTreeItem(id: number): geoLayerTreeNodeType | undefined {
      return <geoLayerTreeNodeType | undefined>getTreeItem(this.geoLayerTree, id)
    },
    async getGeoLayersIdsForUsers(): Promise<any> {
      if (this.geoLayersIdsForUsers.length) {
        return this.geoLayersIdsForUsers
      }
      if (this.isGeoLayersIdsForUsersLoading && this.geoLayersIdsForUsersPromise) {
        return this.geoLayersIdsForUsersPromise
      }
      this.isGeoLayersIdsForUsersLoading = true
      this.geoLayersIdsForUsersPromise = $http
        .get(api_constant + api_geo_layers_ids_for_users)
        .then((res: Record<string, any>) => {
          this.geoLayersIdsForUsers = res._data
          return res._data
        })
        .catch((err: any) => {
          console.error(err)
          return this.geoLayersIdsForUsers
        })
        .finally(() => {
          this.isGeoLayersIdsForUsersLoading = false
          this.geoLayersIdsForUsersPromise = null
        })
      return this.geoLayersIdsForUsersPromise
    },
    async getOsmLayerId(): Promise<any> {
      if (this.osmLayerId) {
        return this.osmLayerId
      }
      if (this.isOsmLayerIdLoading && this.osmLayerIdPromise) {
        return this.osmLayerIdPromise
      }
      this.isOsmLayerIdLoading = true
      this.osmLayerIdPromise = $http
        .get(api_constant + api_osm_layer_id)
        .then((res: Record<string, any>) => {
          this.osmLayerId = res._data[0].value
          return res._data[0].value
        })
        .catch((err: any) => {
          console.error(err)
          return this.osmLayerId
        })
        .finally(() => {
          this.isOsmLayerIdLoading = false
          this.osmLayerIdPromise = null
        })
      return this.osmLayerIdPromise
    },
    async saveGeoLayerSettings() {
      try {
        const body = removeEmptyFields(_cloneDeep(this.geoLayerNode))
        if ('color' in body && body['color'].length === 7) body['color'] += 'FF'
        const method = this.geoLayerNode?.id ? 'patch' : 'post'
        const api = this.geoLayerNode?.id ? api_geo_layer + this.geoLayerNode.id + '/' : api_geo_layer
        await $http[method](api, { body })
        this.geoLayerTree = []
      } catch (err) {
        throw err
      } finally {
        await this.getLayerTree()
      }
    },
    async deleteGeoLayerSettings() {
      this.isLayersLoading = true
      try {
        if (this.geoLayerNode) {
          await $http.delete(api_geo_layer + this.geoLayerNode.id + '/')
          this.geoLayerTree = []
        }
      } catch (err: any) {
        if (err) {
          const { $userStore } = useNuxtApp()
          $userStore.setErrorModalText(err.response._data.detail)
          $userStore.setErrorModal(true)
        }
        this.geoLayerTree = []
      } finally {
        await this.getLayerTree()
      }
    },
    async clearGeoLayer() {
      try {
        if (this.geoLayerNode?.id) {
          await $http.get(api_geo_layer + this.geoLayerNode.id + '/clear/')
        }
      } catch (err: any) {
        if (err) {
          const { $userStore } = useNuxtApp()
          $userStore.setErrorModalText(err.response._data.detail)
          $userStore.setErrorModal(true)
        }
      }
    },
    // Устанавливает статус загрузки (loading) для слоя по его id
    setLayerItemLoading(id: number) {
      const item = getTreeItem(this.geoLayerTree, id)
      if (item) item.status = 'loading'
    },
    // Устанавливает статус удаления (deleting) для слоя по его id
    // setLayerItemDeleting(id: number) {
    //   const item = getTreeItem(this.geoLayerTree, id)
    //   if (item) item.status = 'deleting'
    // },
    // Сбрасывает статус для слоя по его id
    setLayerItemFinished(id: number) {
      const item = getTreeItem(this.geoLayerTree, id)
      if (item) item.status = undefined
    },
    // Устанавливает значение атрибута для слоя по его id
    setLayerItemProperty(params: { id: number; prop: string; value: any }) {
      const item = getTreeItem(this.geoLayerTree, params.id)
      if (item) item[params.prop] = params.value
    },
    showGeoLayer(id: number) {
      if (this.visibleLayersId.indexOf(id) === -1) {
        this.visibleLayersId.push(id)
      } else {
        console.log('Слой уже отображается')
      }
    },
    hideGeoLayer(id: number | null) {
      if (id) {
        const index = this.visibleLayersId.indexOf(id)
        if (index > -1) {
          this.visibleLayersId.splice(index, 1)
        } else {
          console.log('Слой уже скрыт')
        }
      } else {
        this.visibleLayersId = []
      }
    },
    async moveGeoLayer() {
      console.log('drag&drop', this.draggedId, this.droppedId)
      this.isLayersLoading = true
      try {
        if (this.draggedId && this.droppedId) {
          const params = { target_id: this.droppedId }
          await $http.get(api_geo_layer + this.draggedId + '/move/', { params })
          this.geoLayerTree = []
        }
      } catch (err: any) {
        if (err) {
          const { $userStore } = useNuxtApp()
          $userStore.setErrorModalText(err.response._data.detail)
          $userStore.setErrorModal(true)
        }
        this.geoLayerTree = []
      } finally {
        await this.getLayerTree()
      }
    },
    // Установка режима сброса мини-сервиса измерений. Сам сброс происходит в MapMeasureLayer
    resetMeasuring() {
      this.measureReset = true
    },
    toggleMeasuringVisible() {
      this.measureVisible = !this.measureVisible
    },
    async getAddresses(address: string) {
      const { $searchServer } = useNuxtApp()
      if (this.abortGetAddressesController) {
        this.abortGetAddressesController.abort()
      }

      this.abortGetAddressesController = new AbortController()
      const response = await $http.get(`${$searchServer}/search?q=${encodeURIComponent(address)}&format=json`, {
        signal: this.abortGetAddressesController.signal,
      })
      return response._data
    },
    async getMapRoute() {
      if (!this.firstRoutingCoords || !this.secondRoutingCoords) {
        this.routingData = null
        return
      }

      if (this.abortGetMapRouteController) {
        this.abortGetMapRouteController.abort()
      }

      this.abortGetMapRouteController = new AbortController()

      const body = {
        locations: [this.firstRoutingCoords, this.secondRoutingCoords],
        costing: routingModeCompliance[this.routingTransportationMode],
        directions_options: { language: 'ru' },
      }
      this.isRouteLoading = true
      try {
        const response = await $http.post(api_valhalla_request + 'route/', {
          body,
          signal: this.abortGetMapRouteController.signal,
        })
        this.routingData = response._data.route
      } catch (error) {
        console.error(error)
      } finally {
        this.isRouteLoading = false
      }
    },
    async getIsochroneData() {
      if (!this.isochronePointCoords || !this.isochroneContoursTime) {
        this.isochroneData = null
        return
      }

      if (this.abortGetIsochroneController) {
        this.abortGetIsochroneController.abort()
      }

      this.abortGetIsochroneController = new AbortController()

      const body = {
        locations: [this.isochronePointCoords],
        costing: routingModeCompliance[this.routingTransportationMode],
        contours: [{ time: this.isochroneContoursTime }],
        polygons: true,
        directions_options: { language: 'ru' },
      }
      this.isIsochroneLoading = true
      try {
        const response = await $http.post(api_valhalla_request + 'isochrone/', {
          body,
          signal: this.abortGetIsochroneController.signal,
        })
        this.isochroneData = response._data.isochrone
        this.isochroneObjectsData = response._data.grouped_osm_objects
      } catch (error) {
        console.error(error)
      } finally {
        this.isIsochroneLoading = false
      }
    },

    showGeoInfoModal(geoPos: locationPointType, osmObj: Record<string, any>) {
      this.geoInfoOsmObj = osmObj
      const pointLike: Point = {
        type: 'Point',
        coordinates: [geoPos.lon, geoPos.lat],
      }
      this.geoInfoPos = pointLike
      this.toShowGeoInfoModal = true
    },

    onCloseGeoInfoModal() {
      this.geoInfoOsmObj = {}
      this.geoInfoPos = null
    },

    async getMapObject(lat: string | number, lon: string | number) {
      if (this.abortGetMapObjectController) {
        this.abortGetMapObjectController.abort()
      }

      this.abortGetMapObjectController = new AbortController()

      const realtyObjectParams = {
        lat,
        lon,
        radius: 25,
        limit: 10,
      }

      try {
        const response = await $http.get(api_get_realty_objects_in_coords, {
          params: realtyObjectParams,
          signal: this.abortGetMapObjectController.signal,
        })
        if (response._data.length) {
          return response._data[0]
        } else {
          const osmParams = {
            lat,
            lon,
            zoom: 18,
            format: 'json',
            'accept-language': 'ru',
            limit: 1,
          }
          const { $searchServer } = useNuxtApp()
          const osmResponse = await $http.get($searchServer + '/reverse.php', {
            params: osmParams,
            signal: this.abortGetMapObjectController.signal,
          })
          return osmResponse._data
        }
      } catch (error) {
        console.error(error)
      }
    },
  },
})
