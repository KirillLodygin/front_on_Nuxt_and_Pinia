import { defineStore } from 'pinia'
import _cloneDeep from 'lodash/cloneDeep'
import type { objectDataType } from '~/types/geoObjectTypes'

interface MapStoreState {
  mapMode: string
  ctxOSMObject: any
  selectedOSMObject: object
  saVariants: any[]
  saAutoScale: boolean
  goToAddress: object
  saActiveIndex: number
  selectedMapObject: object
  currentRealtyObject: Record<string, any>
  addObjectToComparisonFullscreen: boolean
  polyginToDraw: Record<string, any>
}

export default function (id: string) {
  const store = defineStore(id, {
    state: () =>
      <MapStoreState>{
        mapMode: 'measure',
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
        polyginToDraw: {},
      },
    getters: {},

    actions: {
      resetState() {
        this.$reset()
      },
      setMapMode(value: string) {
        this.mapMode = value
      },
      setCtxOSMObject(value: object) {
        this.ctxOSMObject = value
      },
      setSelectedOSMObject(value: object) {
        this.selectedOSMObject = value
      },
      setSaVariants(value: any[]) {
        console.log(this.$id)
        this.saVariants = value
      },
      setSaAutoScale(value: boolean) {
        this.saAutoScale = value
      },
      setGoToAddress(value: object) {
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
    },
  })
  return store()
}
