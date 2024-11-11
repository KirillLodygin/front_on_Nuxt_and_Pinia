import _, { cloneDeep, isEqual } from 'lodash'
import { string } from 'mathjs'
import { defineStore } from 'pinia'
import { api_fix_realty_object_paths, api_link_cards, api_link_objects, api_realty_objects } from '~/app_constants/api'
import { nestedObjects } from '~/app_constants/geoObjectTabs'
import {
  objectTypeCalcToText,
  objectTypeToText,
  postFields,
  postFieldsCreateObject,
  postFieldsEmpty,
  requiredFieldsCreateObject,
  writableFields,
  writableFieldsCreateObject,
  writableFieldsEmpty,
  requiredFieldsEmpty,
  requiredFields,
} from '~/app_constants/mergedFieldsConst'
import { navigateString } from '~/app_constants/objectsTable'
import type { objectDataType } from '~/types/geoObjectTypes'
import type { objectTypeCalcType, objectTypeType } from '~/types/mapObjectPropertiesTypes'
import useObjectModelTable from '~/store/objectModelTable'
import type { truncate } from '@turf/turf'

type StateType = {
  defaultTab: number
  objectData: objectDataType
  defaultEmptyObjectData: objectDataType
  initialObjectData: objectDataType
  noNavigateNewCard: boolean
  createCardCalcType: objectTypeCalcType | null
  linkExistingCardTable: boolean
  linkExistingCardType: objectTypeCalcType | null
  linkExistingCardIds: number[]
  isTableLoading: boolean
  createAndLinkObjectData: objectDataType
  inheritFromBuilding: string[]
  displayedColumns: string[]
  readOnly: boolean
  linkExistingObjectsTable: boolean
  linkExistingObjectsType: objectTypeType | null
  linkExistingObjectsIds: number[]
  linkExistingObjectsTableFiltersApplied: boolean
  tabsNames: string[]
}

const emptyObjectData = {
  name: '',
  address_raw: '',
  osm_id: 0,
  geo_pos: {
    type: 'Point',
    coordinates: [0, 0],
  },
  geo_obj: {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
      ],
    ],
  },
  object_type: 'Q',
  realty_cards: [],
  children: [],
  decription: null,
}

export default defineStore('geoObject', {
  state: () =>
    <StateType>{
      defaultTab: 0,
      objectData: _.cloneDeep(emptyObjectData),
      defaultEmptyObjectData: _.cloneDeep(emptyObjectData),
      initialObjectData: _.cloneDeep(emptyObjectData),
      createAndLinkObjectData: _.cloneDeep(emptyObjectData),
      noNavigateNewCard: false,
      createCardCalcType: null,
      linkExistingCardTable: false,
      linkExistingCardType: null,
      linkExistingCardIds: [],
      isTableLoading: false,
      inheritFromBuilding: [],
      displayedColumns: [],
      readOnly: false,
      linkExistingObjectsTable: false,
      linkExistingObjectsTableFiltersApplied: false,
      linkExistingObjectsType: null,
      linkExistingObjectsIds: [],
      tabsNames: [],
    },
  actions: {
    resetState() {
      this.$reset()
    },
    toggleReadOnly() {
      this.readOnly = !this.readOnly
    },
    setDefaultTab(value: number) {
      this.defaultTab = value
    },
    setDefaultObjectType(value: objectTypeType) {
      this.defaultEmptyObjectData.object_type = value
    },
    setTabNames(value: string[]) {
      this.tabsNames = value
    },
    toogleLinkExistingCardIds(id: number) {
      if (this.linkExistingCardIds.includes(id)) {
        this.linkExistingCardIds = this.linkExistingCardIds.filter((idsItem) => id !== idsItem)
      } else {
        this.linkExistingCardIds.push(id)
      }
    },
    toogleLinkExistingObjectsIds(id: number) {
      if (this.linkExistingObjectsIds.includes(id)) {
        this.linkExistingObjectsIds = this.linkExistingObjectsIds.filter((idsItem) => id !== idsItem)
      } else {
        this.linkExistingObjectsIds.push(id)
      }
    },
    async returnToObjectFromLinkingCards() {
      const route = useRoute()
      const { $userStore, $catalogsTable }: any = useNuxtApp()
      try {
        this.linkExistingCardTable = false
        navigateTo({ hash: `#${nestedObjects}` })
        if (!this.linkExistingCardIds.length) return
        this.isTableLoading = true
        if (route.path.includes('catalog')) {
          await $catalogsTable.bindObject(this.linkExistingCardIds, 'card')
          console.log('Привязка к каталогу')
          navigateTo({ hash: $catalogsTable.prevHash })
        } else {
          const newObject = await this.createCardLink(this.linkExistingCardIds)
          console.log(newObject.realty_cards, 'before')
          this.objectData = newObject
          this.objectData.realty_cards = this.setRealtyCards(newObject.realty_cards)
          console.log(this.objectData.realty_cards, 'after')
        }
        this.linkExistingCardIds = []
        useObjectModelTable().$reset()
        $userStore.setToast('Привязка прошла успешно!', 'success', 4)
      } catch {
        $userStore.setToast('При привязке произошла ошибка!', 'error', 4)
      } finally {
        this.isTableLoading = false
      }
    },
    async returnToObjectFromLinkingObjects() {
      const route = useRoute()
      const { $userStore, $catalogsTable }: any = useNuxtApp()
      try {
        this.linkExistingObjectsTable = false
        this.linkExistingObjectsTableFiltersApplied = false
        navigateTo({ hash: `#${nestedObjects}` })
        if (!this.linkExistingObjectsIds.length) return
        this.isTableLoading = true
        if (route.path.includes('catalog')) {
          await $catalogsTable.bindObject(this.linkExistingObjectsIds)
          navigateTo({ hash: $catalogsTable.prevHash })
        } else {
          const newObject = await this.createObjectLink(this.linkExistingObjectsIds)
          // this.objectData.children = this.setChildren(newObject.children)

          this.objectData = newObject
          this.objectData.children = this.setChildren(newObject.children)
          this.objectData.realty_cards = this.setRealtyCards(newObject.realty_cards)
        }
        useObjectModelTable().$reset()
        this.linkExistingObjectsIds = []
        this.isTableLoading = false
        $userStore.setToast('Привязка прошла успешно!', 'success', 4)
      } catch {
        $userStore.setToast('При вривязке произошла ошибка!', 'error', 4)
      }
    },
    async returnToObjectFromCreatingCard(id: number) {
      this.noNavigateNewCard = false
      navigateTo({ hash: `#${nestedObjects}` })
      if (!id) return
      this.isTableLoading = true
      // const newObject = await this.createCardLink([id])
      // this.objectData = newObject
      // this.objectData.children = this.setChildren(newObject.children)
      // this.objectData.realty_cards = this.setRealtyCards(newObject.realty_cards)
      this.linkExistingCardIds = []
      this.isTableLoading = false
    },
    async getObjectData(id: any) {
      const data: objectDataType = await $http
        .get(api_realty_objects + id)
        .then((res: Record<string, any>) => res._data)
        .catch((error: any) => {
          if (error.status === 404) {
            // isEmptyObjectError.value = true
          } else {
            // isObjectError.value = error.status
          }
          console.log(error.status)
        })
      console.log('getObjectData', data)
      if (data) {
        data.pk = data.id
        this.objectData = cloneDeep(data)
        this.objectData.description = this.objectData.description ? this.objectData.description : ''
        this.initialObjectData = cloneDeep(data)
        this.initialObjectData.description = this.initialObjectData.description
          ? this.initialObjectData.description
          : ''
      }
    },
    setEmptyObjectData() {
      this.objectData = cloneDeep(this.defaultEmptyObjectData)
      this.initialObjectData = cloneDeep(this.defaultEmptyObjectData)
    },
    async init(id: number) {
      console.log('init')
      if (id === 0) {
        this.setEmptyObjectData()
      } else {
        await this.getObjectData(id)
        if (this.objectData.object_type === 'B' || this.objectData.object_type === 'L') {
          this.initCreateAndLinkObjectData()
        }
        this.readOnly = true
      }
      this.objectData.children = this.setChildren(this.objectData.children)
      this.objectData.realty_cards = this.setRealtyCards(this.objectData.realty_cards)
    },
    initCreateAndLinkObjectData() {
      this.createAndLinkObjectData.object_type = this.objectData.object_type === 'L' ? 'B' : 'Q'
      this.createAndLinkObjectData.address_raw = this.objectData.address_raw
      this.createAndLinkObjectData.parent = this.objectData.name + ' #' + this.objectData.id
      this.createAndLinkObjectData.description = null
      this.createAndLinkObjectData.geo_pos = _.cloneDeep(this.objectData.geo_pos)
      this.createAndLinkObjectData.geo_obj = _.cloneDeep(this.objectData.geo_obj as any).geometries
      this.createAndLinkObjectData.osm_id = this.objectData.osm_id
      this.inheritFromBuilding = ['address_raw', 'geo_pos', 'osm_id']
    },
    async save(disableNavigate: boolean = false) {
      const bodyObject: Record<string, any> = {}
      this.postFields.forEach((field) => {
        bodyObject[field] = this.objectData[field]
      })
      if (this.isNew) {
        let respData: any
        try {
          respData = await $http.post(api_realty_objects, { body: bodyObject }).then((res: Record<string, any>) => res)
        } catch (e: any) {
          if (e.status === 500) {
            await $http.get(api_fix_realty_object_paths)
            respData = await $http
              .post(api_realty_objects, { body: bodyObject })
              .then((res: Record<string, any>) => res)
          }
        }
        const data = respData._data
        console.log('save', data)
        this.initialObjectData = data
        if (!disableNavigate) {
          navigateTo(navigateString.real_estate + data.id)
        }
        // this.objectData = cloneDeep(data)
      } else {
        const data = await $http
          .patch(api_realty_objects + this.objectData.id + '/', { body: bodyObject })
          .then((res: Record<string, any>) => res._data)
        console.log(data)
        this.initialObjectData = data
      }
    },
    setInitial() {
      this.objectData = cloneDeep(this.initialObjectData)
    },
    async createObjectAndLink() {
      this.isTableLoading = true
      const bodyObject: Record<string, any> = {}
      postFieldsCreateObject.forEach((field) => {
        bodyObject[field] = this.createAndLinkObjectData[field]
      })

      // if (!bodyObject.geo_obj){
      //   bodyObject.geo_obj = emptyObjectData.geo_obj
      // }

      const data: objectDataType = await $http
        .post(api_realty_objects, { body: bodyObject })
        .then((res: Record<string, any>) => res._data)
        .catch((error: any) => {
          if (error.status === 404) {
            // isEmptyObjectError.value = true
          } else {
            // isObjectError.value = error.status
          }
          console.log(error.status)
        })
      console.log(data)
      const newObject = await this.createObjectLink([data.id])
      this.objectData = newObject
      this.objectData.children = this.setChildren(newObject.children)
      this.objectData.realty_cards = this.setRealtyCards(newObject.realty_cards)
      this.isTableLoading = false
    },
    async createObjectLink(ids: number[]) {
      const body = {
        target_ids: ids,
        parent_id: this.objectData.id,
      }
      const data: objectDataType = await $http
        .post(api_realty_objects + api_link_objects, { body: body })
        .then((res: Record<string, any>) => res._data)
      console.log(data)
      return data
    },
    async createCardLink(ids: number[]) {
      const body = {
        add_cards: ids,
        target_id: this.objectData.id,
      }
      const data: objectDataType = await $http
        .post(api_realty_objects + api_link_cards, { body: body })
        .then((res: Record<string, any>) => res._data)
      console.log(data)
      return { ...data, children: this.objectData.children }
    },
    async deleteCardLink(ids: number[], target_id: number) {
      const body = {
        del_cards: ids,
        target_id: target_id,
      }
      const data: objectDataType = await $http
        .post(api_realty_objects + api_link_cards, { body: body })
        .then((res: Record<string, any>) => res._data)
      console.log(data)
      return { ...data, children: this.objectData.children }
    },
    async unlinkObjects(ids: number[]) {
      const body = {
        target_ids: ids,
        parent_id: null,
      }
      const data: objectDataType = await $http
        .post(api_realty_objects + api_link_objects, { body: body })
        .then((res: Record<string, any>) => res._data)
      console.log(data)

      return {
        ...this.objectData,
        children: this.objectData.children.filter((item) => !ids.includes(item.id)),
      }
    },
    async unlinkObjectsWithSideEffect(ids: number[]) {
      this.isTableLoading = true
      const newObject = await this.unlinkObjects(ids)
      this.objectData = newObject
      this.objectData.children = this.setChildren(newObject.children)
      this.objectData.realty_cards = this.setRealtyCards(newObject.realty_cards)
      this.isTableLoading = false
    },
    async linkCardsWithSideEffect(ids: number[]) {
      this.isTableLoading = true
      const newObject = await this.createCardLink(ids)
      this.objectData = newObject
      this.objectData.children = this.setChildren(newObject.children)
      this.objectData.realty_cards = this.setRealtyCards(newObject.realty_cards)
      this.isTableLoading = false
    },
    async unlinkCardsWithSideEffect(ids: number[]) {
      this.isTableLoading = true
      const newObject = await this.unlinkCards(ids)
      this.objectData = newObject
      this.objectData.children = this.setChildren(newObject.children)
      this.objectData.realty_cards = this.setRealtyCards(newObject.realty_cards)
      this.isTableLoading = false
    },
    async unlinkCards(ids: number[]) {
      const body = {
        del_cards: ids,
        target_id: this.objectData.id,
      }
      const data: objectDataType = await $http
        .post(api_realty_objects + api_link_cards, { body: body })
        .then((res: Record<string, any>) => res._data)
      console.log(data)
      return { ...data, children: this.objectData.children }
    },
    setRealtyCards(arr: Record<string, any>[]) {
      const numberOfChildren = this.objectData.children.length
      return arr.map((item, index) => {
        return {
          ...item,
          index: index + numberOfChildren + 1,
        }
      })
    },
    setChildren(arr: objectDataType[]) {
      return arr.map((item, index) => {
        return {
          ...item,
          index: index + 1,
        }
      })
    },
  },
  getters: {
    isNew(): boolean {
      return !this.objectData.id
    },
    writableFields(): string[] {
      return this.isNew ? writableFieldsEmpty : writableFields
    },
    requiredFields(): string[] {
      return this.isNew ? requiredFieldsEmpty : requiredFields
    },
    postFields(): string[] {
      return this.isNew ? postFieldsEmpty : postFields
    },

    isBaseFieldsReady(state) {
      let isReady = true
      if (this.isNew) {
        this.requiredFields.forEach((field) => {
          if (field === 'coordinates_component') {
            if (!state.objectData.geo_pos.coordinates[0] || !state.objectData.geo_pos.coordinates[1]) {
              console.log(field, 'isBaseFieldsReady')
              isReady = false
            }
          } else if (field === 'geo_obj') {
            if (!state.objectData.geo_obj.type) {
              console.log(field, 'isBaseFieldsReady')
              isReady = false
            }
          } else if (!state.objectData[field]) {
            console.log(field, 'isBaseFieldsReady')
            isReady = false
          }
        })
      }
      return isReady
    },
    isBaseFieldsReadyCreateAndLinkObject(state) {
      let isReady = true

      requiredFieldsCreateObject.forEach((field) => {
        if (field === 'coordinates_component') {
          if (
            !state.createAndLinkObjectData.geo_pos.coordinates[0] ||
            !state.createAndLinkObjectData.geo_pos.coordinates[1]
          ) {
            isReady = false
          }
        } else if (field === 'geo_obj') {
          if (!state.createAndLinkObjectData.geo_obj.type) {
            isReady = false
          }
        } else if (!state.createAndLinkObjectData[field]) {
          isReady = false
        }
      })

      return isReady
    },
    isFormChanged(state) {
      let isFormChanged = false
      this.writableFields.forEach((field) => {
        if (!isEqual(state.objectData[field], state.initialObjectData[field])) {
          isFormChanged = true
        }
      })
      return isFormChanged
    },
    linkedObjects(): objectDataType[] {
      return this.objectData.children
    },
    linkedObjectsToDisplayInTable(): objectDataType[] {
      return this.objectData.children.map((item) => {
        const dataItem: any = {}
        const arr = this.displayedColumns
        arr.forEach((field) => {
          if (field === 'type') {
            dataItem[field] = objectTypeToText[item.object_type]
          } else if (field === 'ads_type') {
            dataItem[field] = '-'
          } else if (field === 'func_purpose' && item[field]) {
            dataItem[field] = item[field]?.name
          } else if (field === 'ads_updated_internal' && item[field]) {
            dataItem[field] = reformatDate(item[field])
          } else if (field === 'date') {
            dataItem[field] = '-'
          } else if (!item[field]) {
            dataItem[field] = '-'
          } else dataItem[field] = item[field]
        })
        dataItem.id = item.id
        dataItem.object_type_calc = item.object_type_calc

        return dataItem
      })
    },
    linkedCards(): Record<string, any>[] {
      return this.objectData.realty_cards
    },
    linkedCardsToDisplayInTable(): Record<string, any>[] {
      return this.objectData.realty_cards.map((item) => {
        const dataItem: any = {}
        const arr = this.displayedColumns
        arr.forEach((field) => {
          if (field === 'name') {
            dataItem[field] = 'Карточка №' + item.id
          } else if (field === 'type') {
            dataItem[field] = objectTypeCalcToText[item.object_type_calc]
          } else if (field === 'ads_type' && item[field]) {
            dataItem[field] = item[field] === 'R' ? 'Аренда' : 'Продажа'
          } else if (field === 'func_purpose' && item[field]) {
            dataItem[field] = item[field]?.name
          } else if (field === 'date') {
            if (item.object_type_calc === 'OA') {
              dataItem[field] = reformatDate(item.ads_updated)
            } else dataItem[field] = reformatDate(item.date_calc)
          } else if (field === 'ads_updated_internal' && item[field]) {
            dataItem[field] = reformatDate(item[field])
          } else if (!item[field]) {
            dataItem[field] = '-'
          } else dataItem[field] = item[field]
        })
        dataItem.id = item.id
        dataItem.object_type_calc = item.object_type_calc

        return dataItem
      })
    },
  },
})
