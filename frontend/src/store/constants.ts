import { defineStore } from 'pinia'
import {
  api_fields_options,
  api_functional_purpose,
  api_realty_objects,
  api_reference_book_groups,
  api_reference_books,
  api_realty_objects_realty_cards,
  api_search_fields,
  api_update_distances,
} from '~/app_constants/api'
import type { bookType, referenceBookType } from '~/types/calculationsTypes'
import useUserStore from '~/store/userStore'
import useComparison from '~/store/comparison'
import useAddressVermins from '~/store/addressVermins'
import useMapStore from '~/store/mapStore'

export type fpInterface = {
  calc_type: string
  date: string
  id: number
  name: string
  object_type: string
  type: string
}

export interface ConstantsStateInterface {
  // функциональные назначения
  funcPurposes: fpInterface[]
  isLoadingFuncPurposes: boolean
  funcPurposesPromise: Promise<fpInterface[]> | null
  // поля фильтров по-умолчанию
  searchFields: Record<string, string[]>[]
  isLoadingSearchFields: boolean
  searchFieldsPromise: Promise<referenceBookType[]> | null
  // группы справочников
  referenceBookGroups: referenceBookType[]
  isLoadingReferenceBookGroups: boolean
  referenceBookGroupsPromise: Promise<referenceBookType[]> | null
  // справочники
  referenceBooks: bookType[]
  isLoadingReferenceBooks: boolean
  referenceBooksPromise: Promise<referenceBookType[]> | null
  // свойства полей карточек ОО, ОА, НЕИ
  fieldsOptions: Record<string, any>
  isLoadingFieldsOptions: boolean
  fieldsOptionsPromise: Promise<Record<string, any>> | null
  // свойства полей ОН
  realtyObjectOptions: Record<string, any>
  isLoadingRealtyObjectOptions: boolean
  realtyObjectOptionsPromise: Promise<Record<string, any>> | null
  // карточки для ОН
  realtyObjectRealtyCards: Record<string, any>
  isLoadingRealtyObjectRealtyCards: boolean
  realtyObjectRealtyCardsPromise: Promise<Record<string, any>> | null
}

export default defineStore('constants', {
  state: () =>
    ({
      // функциональные назначения
      funcPurposes: [],
      isLoadingFuncPurposes: false,
      funcPurposesPromise: null,
      // поля фильтров по-умолчанию
      searchFields: [],
      isLoadingSearchFields: false,
      searchFieldsPromise: null,
      // группы справочников
      referenceBookGroups: [],
      isLoadingReferenceBookGroups: false,
      referenceBookGroupsPromise: null,
      // справочники
      referenceBooks: [],
      isLoadingReferenceBooks: false,
      referenceBooksPromise: null,
      // свойства полей карточек ОО, ОА, НЕИ
      fieldsOptions: {},
      isLoadingFieldsOptions: false,
      fieldsOptionsPromise: null,
      // свойства полей ОН
      realtyObjectOptions: {},
      isLoadingRealtyObjectOptions: false,
      realtyObjectOptionsPromise: null,
      // карточки для ОН
      realtyObjectRealtyCards: {},
      isLoadingRealtyObjectRealtyCards: false,
      realtyObjectRealtyCardsPromise: null,
    }) as ConstantsStateInterface,
  actions: {
    resetState() {
      this.$reset()
    },
    async getFuncPurposes(): Promise<any> {
      if (this.funcPurposes.length) {
        return this.funcPurposes
      }
      if (this.isLoadingFuncPurposes && this.funcPurposesPromise) {
        return this.funcPurposesPromise
      }
      this.isLoadingFuncPurposes = true
      this.funcPurposesPromise = $http
        .get(api_functional_purpose)
        .then((res: Record<string, any>) => {
          this.funcPurposes = res._data
          return res._data
        })
        .catch((err: any) => {
          console.error(err)
        })
        .finally(() => {
          this.isLoadingFuncPurposes = false
          this.funcPurposesPromise = null
        })
      return this.funcPurposesPromise
    },
    async getSearchFields(): Promise<any> {
      if (Object.keys(this.searchFields).length) {
        return this.searchFields
      }
      if (this.isLoadingSearchFields && this.searchFieldsPromise) {
        return this.searchFieldsPromise
      }
      this.isLoadingSearchFields = true
      this.searchFieldsPromise = $http
        .get(api_search_fields)
        .then((res: Record<string, any>) => {
          this.searchFields = res._data
          return res._data
        })
        .catch((err: any) => {
          console.error(err)
        })
        .finally(() => {
          this.isLoadingSearchFields = false
          this.searchFieldsPromise = null
        })
      return this.searchFieldsPromise
    },
    async getReferenceBookGroups(): Promise<any> {
      if (this.referenceBookGroups.length) {
        return this.referenceBookGroups
      }
      if (this.isLoadingReferenceBookGroups && this.referenceBookGroupsPromise) {
        return this.referenceBookGroupsPromise
      }
      this.isLoadingReferenceBookGroups = true
      this.referenceBookGroupsPromise = $http
        .get(api_reference_book_groups)
        .then((res: Record<string, any>) => {
          this.referenceBookGroups = res._data
          return res._data
        })
        .catch((err: any) => {
          console.error(err)
        })
        .finally(() => {
          this.isLoadingReferenceBookGroups = false
          this.referenceBookGroupsPromise = null
        })
      return this.referenceBookGroupsPromise
    },
    async getReferenceBooks(): Promise<any> {
      if (this.referenceBooks.length) {
        return this.referenceBooks
      }
      if (this.isLoadingReferenceBooks && this.referenceBooksPromise) {
        return this.referenceBooksPromise
      }
      this.isLoadingReferenceBooks = true
      this.referenceBooksPromise = $http
        .get(api_reference_books)
        .then((res: Record<string, any>) => {
          this.referenceBooks = res._data
          return res._data
        })
        .catch((err: any) => {
          console.error(err)
        })
        .finally(() => {
          this.isLoadingReferenceBooks = false
          this.referenceBooksPromise = null
        })
      return this.referenceBooksPromise
    },
    async getFieldsOptions(): Promise<any> {
      if (Object.keys(this.fieldsOptions).length) {
        return this.fieldsOptions
      }
      if (this.isLoadingFieldsOptions && this.fieldsOptionsPromise) {
        return this.fieldsOptionsPromise
      }
      this.isLoadingFieldsOptions = true
      this.fieldsOptionsPromise = $http
        .options(api_fields_options)
        .then((res: Record<string, any>) => {
          this.fieldsOptions = res._data.actions.POST
          return res._data.actions.POST
        })
        .catch((err: any) => {
          console.error(err)
        })
        .finally(() => {
          this.isLoadingFieldsOptions = false
          this.fieldsOptionsPromise = null
        })
      return this.fieldsOptionsPromise
    },
    async getRealtyObjectOptions(): Promise<Record<string, any>> {
      console.log('getRealtyObjectOptions')
      if (this.realtyObjectOptions && Object.keys(this.realtyObjectOptions).length) {
        return this.realtyObjectOptions
      }
      if (this.isLoadingRealtyObjectOptions && this.realtyObjectOptionsPromise) {
        return this.realtyObjectOptionsPromise
      }
      this.isLoadingRealtyObjectOptions = true
      this.realtyObjectOptionsPromise = $http
        .options(api_realty_objects)
        .then((res: Record<string, any>) => {
          this.realtyObjectOptions = res._data.actions.POST
          useComparison().initDistanceObjects()
          return res._data.actions.POST
        })
        .catch((err: any) => {
          console.error(err)
          return {}
        })
        .finally(() => {
          this.isLoadingRealtyObjectOptions = false
          this.realtyObjectOptionsPromise = null
        })
      return this.realtyObjectOptionsPromise
    },
    async getRealtyObjectRealtyCards(id: number | null, geoPos: { lon: number; lat: number } | null): Promise<any> {
      // if (this.isLoadingRealtyObjectRealtyCards && this.realtyObjectRealtyCardsPromise) {
      //   return this.realtyObjectRealtyCardsPromise
      // }
      this.isLoadingRealtyObjectRealtyCards = true
      if (id !== null) {
        this.realtyObjectRealtyCardsPromise = $http
          .get(`${api_realty_objects_realty_cards}${id}`)
          .then((res: Record<string, any>) => {
            this.realtyObjectRealtyCards = res._data.results[0]
            return res._data.results[0]
          })
          .catch((err: any) => {
            console.error(err)
          })
          .finally(() => {
            this.isLoadingRealtyObjectRealtyCards = false
            this.realtyObjectRealtyCardsPromise = null
          })
      } else if (geoPos) {
        this.realtyObjectRealtyCardsPromise = $http
          .post(api_update_distances, {
            body: {
              lon: geoPos.lon,
              lat: geoPos.lat,
            },
          })
          .then((res: Record<string, any>) => {
            console.log(res)
            this.realtyObjectRealtyCards = res._data
            return res._data
          })
          .catch((err: any) => {
            console.error(err)
          })
          .finally(() => {
            this.isLoadingRealtyObjectRealtyCards = false
            this.realtyObjectRealtyCardsPromise = null
          })
      }

      return this.realtyObjectRealtyCardsPromise
    },
    getAll() {
      console.log('getAll')
      this.getFuncPurposes()
      this.getReferenceBookGroups()
      this.getReferenceBooks()
      this.getFieldsOptions()
      this.getRealtyObjectOptions()
      useUserStore().getAllUsers()
      useAddressVermins().getWordParasites()
      // useMapStore().getLayerTree()
    },
  },
})
