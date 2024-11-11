import { navigateTo } from 'nuxt/app'
import { isEmpty, cloneDeep, isEqual } from 'lodash'
import { defineStore } from 'pinia'
import { utils, writeFileXLSX } from 'xlsx'
import type {
  distanceObjectType,
  pricingFactorType,
  comparisonObjectsType,
  activeComparisonItemType,
  activeGeoTsofItemType,
  objectTypeCalcColumnValueType,
} from '~/types/comparisonTypes'
import useConstants from '~/store/constants'
import { currentComparisonList } from '~/app_constants/comparisonConsts'
import { api_compare, api_update_distances } from '~/app_constants/api'
import { noDataAvailable, COMPARE } from '~/app_constants/comparisonConsts'
import { _DESCR } from '~/app_constants/geoTsofTable'
import { reformatDate } from '~/utils/objectUtils'
import { useUpdateComparisonObjectsCoefficients } from '~/composables/Comparison/useUpdateComparisonObjectsCoefficients'
import { useInitPricingFactors } from '~/composables/Comparison/useInitPricingFactors'
import { useCollectCompareForSave } from '~/composables/Comparison/useCollectCompareForSave'
import { useInitDistanceObjects } from '~/composables/Comparison/useInitDistanceObjects'

type StateType = {
  isComparisonModal: boolean
  isShowStub: boolean
  isShowSavingStub: boolean
  comparisonObjects: Array<comparisonObjectsType>
  savedComparisonsList: Array<comparisonObjectsType>
  currentComparisonObjects: Array<comparisonObjectsType>
  compareId: number | string
  previousCompareId: number | string
  compareLabel: string
  compareNewLabel: string
  activeComparisonItem: activeComparisonItemType | null
  activeGeoTsofItem: activeGeoTsofItemType | null
  distanceObjects: Array<distanceObjectType>
  pricingFactorsArr: Array<pricingFactorType>
  currentPricingFactorsArr: Array<pricingFactorType>
  compareName: string
  isMiniInfoModalForSave: boolean
  description: string
  savedCompareId: number | string | null
  compare: Record<string, any> | undefined
  notSavedCompareFiles: Array<File>
  compareFiles: Array<File>
  isCompareStart: boolean
  isMapPointModal: boolean
  geoPos: {
    lon: number | null
    lat: number | null
    label: string
  }
  isShowMap: boolean
  isAlertQuestionOpen: boolean
  isAlert: boolean
  isCleanAlertOpen: boolean
  isClearCompare: boolean
  isAlertSaveChangesOpen: boolean
  isAlertSaveDeleteOpen: boolean
}

export default defineStore('comparison', {
  state: () =>
    <StateType>{
      isComparisonModal: false,
      isShowStub: false,
      isShowSavingStub: false,
      comparisonObjects: [],
      currentComparisonObjects: [],
      savedComparisonsList: [],
      compareId: '',
      previousCompareId: '',
      compareLabel: '',
      compareNewLabel: '',
      activeComparisonItem: null,
      activeGeoTsofItem: null,
      distanceObjects: [],
      pricingFactorsArr: [],
      currentPricingFactorsArr: [],
      compareName: '',
      isMiniInfoModalForSave: false,
      description: '',
      savedCompareId: null,
      compare: {},
      notSavedCompareFiles: [],
      compareFiles: [],
      isCompareStart: false,
      isMapPointModal: false,
      geoPos: {
        lon: null,
        lat: null,
        label: '',
      },
      isShowMap: true,
      isAlertQuestionOpen: false,
      isAlert: false,
      isCleanAlertOpen: false,
      isClearCompare: false,
      isAlertSaveChangesOpen: false,
      isAlertSaveDeleteOpen: false,
    },
  getters: {
    getComparisonObjectsForTopMenu: (state: StateType) => () => {
      return state.comparisonObjects.map((obj) => {
        const address = obj.address_raw ? obj.address_raw : `${obj.geo_pos.coordinates}`
        return {
          address: address,
          id: obj.id,
        }
      })
    },

    getIsOpenMenuList: (state: StateType) => (field: string) => {
      const index = state.distanceObjects.findIndex((item: distanceObjectType) => item.field === field)
      return state.distanceObjects[index].is_open
    },

    getIsOpenPricingFactor: (state: StateType) => (field: string) => {
      const index = state.currentPricingFactorsArr.findIndex(
        (item: pricingFactorType) => item.pricing_factor.field === field,
      )
      return state.currentPricingFactorsArr[index].is_open
    },

    getComparisonObjectIndex: (state: StateType) => (id: number) => {
      if (state.currentComparisonObjects.length && state.compareId !== currentComparisonList) {
        return state.currentComparisonObjects.findIndex((obj) => obj.id === id)
      }
      return state.comparisonObjects.findIndex((obj) => obj.id === id)
    },

    getObjectTypeCalcColumnValue: () => (value: objectTypeCalcColumnValueType) => {
      const order = ['OA', 'NE', 'OO']
      const icons: any = {
        OA: '<i class="icon ksi_scale-left"></i>',
        NE: '<i class="icon fi_sign_post"></i>',
        OO: '<i class="icon ksi_analogs"></i>',
      }
      const labels: any = {
        OA: 'Оценка',
        NE: 'Исследование',
        OO: 'Предложение',
      }

      const sortedOrder = order.filter((key) => value[key])

      const formattedValue = sortedOrder.map((key) => ({ icon: icons[key], label: labels[key] }))

      return formattedValue.length ? formattedValue : [{ icon: '<i class="icon fi_minus"></i>', label: 'Нет данных' }]
    },

    getIsCurrentComparisonObjectsChanged: (state: StateType) => () => {
      if (!state.currentComparisonObjects.length) return state.currentComparisonObjects.length
      if (state.compareId === currentComparisonList) return state.compareId !== currentComparisonList

      const index = state.savedComparisonsList.findIndex((item: comparisonObjectsType) => item.id === state.compareId)
      return !isEqual(state.savedComparisonsList[index].comparation_objects, state.currentComparisonObjects)
    },

    getComparisonObjectNameById: (state: StateType) =>  (currentId: number | string | null) => {
      if (!currentId) return ''
      const index = state.savedComparisonsList.findIndex((item: comparisonObjectsType) => item.id === Number(currentId))
      if (index === -1) {
        return currentId
      }
      return state.savedComparisonsList[index].name
    },
  },

  actions: {
    resetState() {
      this.$reset()
    },
    onIsShowStub() {
      this.isShowStub = true
    },

    offIsShowStub() {
      this.isShowStub = false
    },

    onIsShowSavingStub() {
      this.isShowSavingStub = true
    },

    offIsShowSavingStub() {
      this.isShowSavingStub = false
    },

    onIsAlertQuestionOpen(val: boolean) {
      this.isAlertQuestionOpen = val
    },

    onIsAlert(val: boolean) {
      this.isAlert = val
    },

    onIsAlertSaveDeleteOpen(val: boolean) {
      this.isAlertSaveDeleteOpen = val
    },

    onIsCleanAlertOpen(val: boolean) {
      this.isCleanAlertOpen = val
    },

    onIsAlertSaveChangesOpen(
      val: boolean,
      newCompareId: number | string = '',
      previousCompareId: number | string = '',
    ) {
      this.isAlertSaveChangesOpen = val

      if (newCompareId) {
        this.previousCompareId = previousCompareId
        this.compareId = newCompareId
      }
    },

    deleteComparisonObject(index: number) {
      this.activeComparisonItem = null
      if (this.currentComparisonObjects.length) {
        this.currentComparisonObjects.splice(index, 1)
      }
      if (this.compareId === currentComparisonList) {
        this.comparisonObjects.splice(index, 1)
      }
    },

    setNewCompareName(newName: string) {
      this.compareName = newName
    },

    addComparisonObject(obj: comparisonObjectsType) {
      this.currentComparisonObjects.push(obj)

      if (!this.compareId || this.compareId === currentComparisonList) {
        if (!this.comparisonObjects.length) {
          this.setNewCompareName('')
        }
        this.comparisonObjects.push(obj)
        if (!this.compareId) {
          this.compareId = currentComparisonList
          navigateTo({ hash: `#${currentComparisonList}` })
        }
      }

      if (this.compareId && this.compareId !== currentComparisonList) {
        const index = this.savedComparisonsList.findIndex((item: comparisonObjectsType) => item.id === this.compareId)
        this.savedComparisonsList[index].comparation_objects = cloneDeep(this.currentComparisonObjects)
      }
    },

    setCompareId(compareId: number | string) {
      this.previousCompareId = this.compareId
      this.compareId = compareId

      if (!this.previousCompareId || this.previousCompareId === currentComparisonList) {
        this.pricingFactorsArr = cloneDeep(this.currentPricingFactorsArr)
      }

      const index = this.savedComparisonsList.findIndex((item: comparisonObjectsType) => item.id === this.compareId)
      this.description =
        !this.compareId || this.compareId === currentComparisonList ? '' : this.savedComparisonsList[index].description
      this.setSavedCompareId(compareId)
    },

    setCompareLabel(compareLabel: string) {
      this.compareLabel = compareLabel
    },

    setCompareNewLabel(str: string) {
      this.compareNewLabel = str
    },

    setGeoPosNewLabel(str: string) {
      this.geoPos.label = str
    },

    resetAuxiliaryValues() {
      this.compareNewLabel = ''
      this.compareId = ''
      this.previousCompareId = ''
      this.compareLabel = ''
    },

    resetActiveComparisonItem() {
      this.activeComparisonItem = null
    },

    isSavingImpossible() {
      const label = this.compareNewLabel || this.compareName
      return this.savedComparisonsList.map((item: comparisonObjectsType) => item.name).includes(label)
    },

    async setCompareNewName() {
      const index = this.savedComparisonsList.findIndex((item: comparisonObjectsType) => item.id === this.compareId)
      this.savedComparisonsList[index].name = this.compareNewLabel || this.compareLabel
      this.savedComparisonsList[index].description = this.description
      await $http.patch(api_compare + this.compareId + '/', { body: this.savedComparisonsList[index] })
      this.resetAuxiliaryValues()
    },

    async deleteCompare() {
      const index = this.savedComparisonsList.findIndex((item: comparisonObjectsType) => item.id === this.compareId)
      this.savedComparisonsList.splice(index, 1)
      await $http.delete(api_compare + this.compareId + '/')
      this.resetAuxiliaryValues()
    },

    setActiveComparisonItem(item: activeComparisonItemType | null) {
      this.activeComparisonItem = item
    },

    isDeleteActiveComparisonItem() {
      if (!this.activeComparisonItem) return

      const index = this.currentComparisonObjects.findIndex(
        (item: comparisonObjectsType) => item.id === this.activeComparisonItem?.id,
      )

      this.currentComparisonObjects.splice(index, 1)

      if (this.compareId === currentComparisonList) {
        this.comparisonObjects.splice(index, 1)
      }

      if (this.compareId && this.compareId !== currentComparisonList && !this.currentComparisonObjects.length) {
        this.onIsAlertSaveDeleteOpen(true)
      }

      this.activeComparisonItem = null
    },

    initDistanceObjects() {
      if (isEmpty(useConstants().realtyObjectOptions)) {
        this.distanceObjects = []
        return
      }
      this.distanceObjects = useInitDistanceObjects()
    },

    isCheckedInstanceObject(field: string) {
      const index = this.distanceObjects.findIndex((item: distanceObjectType) => item.field === field)
      this.distanceObjects[index].check = !this.distanceObjects[index].check
    },

    resetIsListOpenLists() {
      this.distanceObjects.forEach((item: distanceObjectType) => {
        item.is_open = false
      })
    },

    resetPricingFactorsArr() {
      this.currentPricingFactorsArr.forEach((item: pricingFactorType) => {
        item.is_open = false
      })
    },

    updateIsListOpenLists(field: string) {
      this.resetIsListOpenLists()
      const index = this.distanceObjects.findIndex((item: distanceObjectType) => item.field === field)
      this.distanceObjects[index].is_open = true
    },

    updateIsListOpenPricingFactors(field: string) {
      this.resetPricingFactorsArr()
      const index = this.currentPricingFactorsArr.findIndex(
        (item: pricingFactorType) => item.pricing_factor.field === field,
      )
      this.currentPricingFactorsArr[index].is_open = true
    },

    setNewDistanceValue(value: string, field: string) {
      const index = this.distanceObjects.findIndex((item: distanceObjectType) => item.field === field)
      this.distanceObjects[index].distance = value
    },

    setNewWeightValue(value: number, field: string) {
      const index = this.distanceObjects.findIndex((item: distanceObjectType) => item.field === field)
      this.distanceObjects[index].weight = value
    },

    setPricingFactorNewWeightValue(value: number, field: string) {
      const index = this.currentPricingFactorsArr.findIndex(
        (item: pricingFactorType) => item.pricing_factor.field === field,
      )
      this.currentPricingFactorsArr[index].weight = value
      if (this.compareId === currentComparisonList) {
        this.pricingFactorsArr[index].weight = value
      }
    },

    async initPricingFactors() {
      if (this.currentPricingFactorsArr.length && this.compareId && this.compareId !== currentComparisonList) return
      if (this.pricingFactorsArr.length) return
      this.isShowStub = true
      this.pricingFactorsArr = cloneDeep(await useInitPricingFactors())
      this.currentPricingFactorsArr = cloneDeep(this.pricingFactorsArr)
    },

    async getDistancesArr() {
      if (!this.isShowStub) {
        this.isShowStub = true
      }
      if (!this.currentComparisonObjects.length) {
        this.currentComparisonObjects = this.comparisonObjects
      }
      let geoPointsArr: Array<comparisonObjectsType> = []
      const comparisonObjectsIds: Array<number> = this.currentComparisonObjects
        .map((item) => item.id)
        .filter((id: number) => id < 0)
      const geoPointsIdCounter = comparisonObjectsIds.length ? Math.min(...comparisonObjectsIds) : 0

      if (geoPointsIdCounter) {
        for (let index = geoPointsIdCounter; index < 0; index++) {
          const currentComparisonObjectIndex = this.currentComparisonObjects.findIndex(
            (item: comparisonObjectsType) => item.id === index,
          )
          if (currentComparisonObjectIndex !== -1) {
            geoPointsArr.push(this.currentComparisonObjects[currentComparisonObjectIndex])
            this.currentComparisonObjects.splice(currentComparisonObjectIndex, 1)
          }
        }
      }

      const currentComparisonObjectsIds = this.currentComparisonObjects.map((item) => item.id)
      if (currentComparisonObjectsIds.length) {
        const distancesArr = this.currentPricingFactorsArr.map((item) => `${item.pricing_factor.field}${_DESCR}`)

        const response = await $http.post(api_update_distances, {
          body: { realty_objects: currentComparisonObjectsIds },
        })
        const respDataIds: Array<number> = response._data.map((item: comparisonObjectsType) => item.id)
        respDataIds.forEach((id) => {
          const respDataObj = response._data.filter((item: comparisonObjectsType) => item.id === id)[0]

          const currentComparisonObjectIndex = this.currentComparisonObjects.findIndex(
            (item: comparisonObjectsType) => item.id === id,
          )
          if (currentComparisonObjectIndex !== -1) {
            const obj = cloneDeep(this.currentComparisonObjects[currentComparisonObjectIndex])
            distancesArr.forEach((distance) => {
              obj[distance] = respDataObj[distance]
            })
            this.currentComparisonObjects.splice(currentComparisonObjectIndex, 1, obj)
          }
        })
      }

      this.currentComparisonObjects = this.currentComparisonObjects.concat(geoPointsArr)

      if (this.compareId === currentComparisonList) {
        this.comparisonObjects = cloneDeep(this.currentComparisonObjects)
      }

      this.isShowStub = false
    },

    async addCompareObjectFromPoint() {
      this.isShowStub = true
      if (!this.pricingFactorsArr.length) {
        await this.initPricingFactors()
        this.isShowStub = false
      }
      if (!this.currentComparisonObjects.length && !this.comparisonObjects.length)
        this.compareId = currentComparisonList
      const comparisonObjects = this.currentComparisonObjects.length
        ? this.currentComparisonObjects
        : this.comparisonObjects

      const comparisonObjectsIds: Array<number> = comparisonObjects
        .map((item) => item.id)
        .filter((id: number) => id < 0)
      const geoPointsIdCounter = comparisonObjectsIds.length ? Math.min(...comparisonObjectsIds) - 1 : -1

      const pointObject: Record<string, any> = {
        id: geoPointsIdCounter,
        object_type: null,
        geo_pos: {
          coordinates: [this.geoPos.lon, this.geoPos.lat],
          type: 'Point',
        },
        address_raw: `[${this.geoPos.lon}, ${this.geoPos.lat}]`,
        name: this.geoPos.label || `[${this.geoPos.lon}, ${this.geoPos.lat}]`,
        object_type_calc: null,
        func_purpose: null,
        added_date: new Date().toISOString().split('T')[0].split('-').reverse().join('.'),
      }

      const response = await $http.post(api_update_distances, {
        body: {
          lon: this.geoPos.lon,
          lat: this.geoPos.lat,
        },
      })

      const pricingFactorsArr = this.pricingFactorsArr.length ? this.pricingFactorsArr : this.currentPricingFactorsArr
      const distancesArr = pricingFactorsArr.map((item) => `${item.pricing_factor.field}${_DESCR}`)
      distancesArr.forEach((distance) => {
        pointObject[distance] = response._data[distance]
      })

      this.currentComparisonObjects.push(pointObject)
      if (this.compareId === currentComparisonList) {
        this.comparisonObjects.push(pointObject)
      }
      this.isShowStub = false
    },

    onCheckPricingFactor(index: number) {
      this.currentPricingFactorsArr[index].is_checked = !this.currentPricingFactorsArr[index].is_checked
      if (this.compareId === currentComparisonList) {
        this.pricingFactorsArr[index].is_checked = !this.pricingFactorsArr[index].is_checked
      }
    },

    setPricingFactorValue(value: string, index: number) {
      this.currentPricingFactorsArr[index].all_types = value
      if (this.compareId === currentComparisonList) {
        this.pricingFactorsArr[index].all_types = value
      }
    },

    changeIsComparisonModal(val: boolean) {
      this.isComparisonModal = val
    },

    isUpdateComparisonObjects(arr: Array<comparisonObjectsType>) {
      this.currentComparisonObjects = cloneDeep(arr)
    },

    removeComparisonObject(obj: comparisonObjectsType) {
      const index = this.currentComparisonObjects.findIndex((item: comparisonObjectsType) => item.id === obj.id)
      this.currentComparisonObjects.splice(index, 1)
      if (this.compareId === currentComparisonList) {
        this.comparisonObjects.splice(index, 1)
      }
      this.activeComparisonItem = null
    },

    setCompareName() {
      this.compareName = `Сравнение от ${reformatDate(new Date().toISOString())}`
    },

    setDescription(val: string) {
      this.description = val
    },

    isUpdateComparisonObjectsCoefficients() {
      this.currentComparisonObjects = cloneDeep(useUpdateComparisonObjectsCoefficients())
    },

    onIsMiniInfoModalForSave(val: boolean) {
      this.isMiniInfoModalForSave = val
    },

    setSavedCompareId(id: number | string | null) {
      this.savedCompareId = id
    },

    async compareSave() {
      try {
        if (this.savedCompareId && this.savedCompareId !== currentComparisonList) {
          this.compare = useCollectCompareForSave()
          await $http.patch(api_compare + this.savedCompareId + '/', { body: this.compare })
          this.changeSavedComparisonsList(this.compare.comparation_objects)
        } else {
          this.compare = useCollectCompareForSave()
          const compare = await $http.post(api_compare, { body: this.compare })
          this.setSavedCompareId(compare._data.id)
          this.previousCompareId = this.compareId
          this.compareId = compare._data.id
          const index = this.savedComparisonsList.findIndex(
            (item: comparisonObjectsType) => item.name === compare._data.name,
          )
          if (index !== -1) {
            this.savedComparisonsList.splice(index, 1)
          }
          this.savedComparisonsList.push(compare._data)
        }
      } catch (err) {
        console.log(err)
      }
    },

    async setSavedComparisons() {
      try {
        const { _data } = await $http.get(api_compare)
        this.savedComparisonsList = cloneDeep(_data.results)
      } catch (err) {
        console.log(err)
      }
    },

    changeSavedComparisonsList(obj: comparisonObjectsType) {
      if (!this.previousCompareId || this.previousCompareId === currentComparisonList) return

      const index = this.savedComparisonsList.findIndex(
        (item: comparisonObjectsType) => item.id === this.previousCompareId,
      )
      this.savedComparisonsList[index].comparation_objects = cloneDeep(obj)
    },

    changeCurrentComparisonObjects() {
      if (this.compareId && this.compareId !== currentComparisonList) {
        const index = this.savedComparisonsList.findIndex((item: comparisonObjectsType) => item.id === this.compareId)

        this.currentComparisonObjects = cloneDeep(this.savedComparisonsList[index].comparation_objects)
        this.setNewCompareName(this.savedComparisonsList[index].name)

        this.currentPricingFactorsArr = cloneDeep(this.savedComparisonsList[index].comparation_data)
      }
    },

    isClearComparisonObjects() {
      this.comparisonObjects = []
      this.pricingFactorsArr = []
      this.currentComparisonObjects = []
      this.currentPricingFactorsArr = []
      this.activeComparisonItem = null
      this.isClearCompare = false
    },

    isOpenCurrentCompare() {
      this.previousCompareId = this.compareId
      this.changeSavedComparisonsList(this.currentComparisonObjects)
      this.currentComparisonObjects =
        this.comparisonObjects.length && !this.isClearCompare ? cloneDeep(this.comparisonObjects) : []
      this.currentPricingFactorsArr =
        this.comparisonObjects.length && !this.isClearCompare ? cloneDeep(this.pricingFactorsArr) : []
      this.compareId = currentComparisonList
      this.setSavedCompareId(currentComparisonList)
      this.setCompareName()
    },

    isOpenCompareByRoute(name: string) {
      if (name === currentComparisonList) {
        this.isOpenCurrentCompare()
        return
      }
      const index = this.savedComparisonsList.findIndex((item: comparisonObjectsType) => item.name === name)

      if (index !== -1) {
        this.currentComparisonObjects = cloneDeep(this.savedComparisonsList[index].comparation_objects)
        this.setNewCompareName(this.savedComparisonsList[index].name)
        this.compareId = this.savedComparisonsList[index].id
        this.currentPricingFactorsArr = cloneDeep(this.savedComparisonsList[index].comparation_data)
      } else {
        this.compareId = currentComparisonList
        this.currentComparisonObjects = cloneDeep(this.comparisonObjects)
        this.pricingFactorsArr = []
        this.setCompareName()
      }
    },

    initCurrentCompare() {
      if (this.comparisonObjects.length && (!this.compareId || this.compareId === currentComparisonList)) {
        this.currentComparisonObjects = cloneDeep(this.comparisonObjects)
        this.currentPricingFactorsArr = cloneDeep(this.pricingFactorsArr)
        this.setCompareName()
      }
    },

    switchIsCompareStart(val: boolean) {
      this.isCompareStart = val
    },

    isMapPointModalOn() {
      this.isMapPointModal = true
    },

    isMapPointModalOff() {
      this.isMapPointModal = false
    },

    switchIsShowMap() {
      this.isShowMap = !this.isShowMap
    },

    exportExcel() {
      const finalTableArr: Array<string | number>[] = []

      const firstLine: Array<string | number> = ['Показатель'].concat(
        this.currentComparisonObjects.map((item) => item.id),
      )
      finalTableArr.push(firstLine)
      const addressLine: Array<string> = ['Адрес'].concat(this.currentComparisonObjects.map((item) => item.address_raw))
      finalTableArr.push(addressLine)

      for (const pricingFactor of this.currentPricingFactorsArr.filter((item) => item.is_checked)) {
        const currentLine: Array<string | number> = [pricingFactor.pricing_factor.label].concat(
          this.currentComparisonObjects.map((item) =>
            item.coefficients[pricingFactor.pricing_factor.field] === noDataAvailable
              ? noDataAvailable
              : Number(item.coefficients[pricingFactor.pricing_factor.field]).toFixed(2),
          ),
        )
        finalTableArr.push(currentLine)
      }

      const finalLine: Array<string | number> = ['Общий балл'].concat(
        this.currentComparisonObjects.map((item) =>
          item.final_coefficient === noDataAvailable ? noDataAvailable : Number(item.final_coefficient).toFixed(2),
        ),
      )
      finalTableArr.push(finalLine)

      console.log('finalTableArr ', cloneDeep(finalTableArr))

      const ws = utils.aoa_to_sheet(finalTableArr, { sheetStubs: true })

      for (const cell in ws) {
        if (ws[cell].v?.toString().length > 0) {
          const cellArr = ws[cell].v?.toString().split(' ')
          if (cellArr.length > 1 && !ws[cell].v?.toString().includes('\n')) {
            let cellString = ''
            for (let i = 0; i < cellArr.length - 1; i++) {
              cellString = cellString + cellArr[i] + ' '
              if (cellString.length > 30) {
                cellString = cellArr[i] + ' '
                cellArr[i - 1] = cellArr[i - 1] + '\n'
              }
            }
            ws[cell].v = cellArr.join(' ')
          }
        }
      }

      ws['!cols'] = [{ wch: 40 }]
      for (let i = 0; i < this.currentComparisonObjects.length; i++) {
        ws['!cols'].push({ wch: 32 })
      }
      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, 'Sheet1', true)

      writeFileXLSX(wb, 'SheetJSTableExport.xlsx')
    },

    onClearCompare() {
      this.isClearCompare = true
    },
  },
})
