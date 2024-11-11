import { defineStore } from 'pinia'
import {
  api_functional_purpose,
  api_user,
  api_user_profile,
  api_users,
  getModifiedByUserRealtiesUrl,
} from '~/app_constants/api'
import objectsFiltersStore from '~/store/objectsFiltersStore'
import referencesFiltersStore from '~/store/referencesFiltersStore'
import useObjectStore from '~/store/objectStore'
import useMapStore from '~/store/mapStore'
import useBModal from '~/store/bvModal'
import useAddressVermins from '~/store/addressVermins'
import useCalculations from '~/store/calculations'
import useConstants from '~/store/constants'
import useGeoObject from '~/store/geoObject'
import useHistoryOffers from '~/store/CardSummary/useHistoryOffers'
import useHistoryEstimation from '~/store/CardSummary/useHistoryEstimation'
import useObjectModelTable from '~/store/objectModelTable'
import useCatalogsTable from '~/store/catalogsTable'
import useGeoTsofs from '~/store/geoTsofs'
import useComparison from '~/store/comparison'
import useDisplayCompareObject from '~/store/displayCompareObjectStore.js'

interface pathProps {
  path: string
  hash: string
}

export default defineStore('user', {
  state: () => ({
    toasts: <Record<number, Record<string, any>>>{},
    errorModal: false,
    errorModalText: null as string | null,
    page: '',
    allUsers: [],
    isLoadingAllUsers: false,
    allUsersPromise: null as Promise<Record<string, any>[]> | null,
    oldPath: <pathProps>{ path: '/' },
    newPath: <pathProps>{},
    evaluationComponent: 'orders',
    modifiedByUserRealties: [],
    modifiedByUserRealtiesCount: 0,
    modeOfPage: '',
    calcTypeForPage: '',
    pageLoading: false,
  }),
  actions: {
    resetState() {
      this.$reset()
    },
    clearAllStores(trigger: string = 'All') {
      if (trigger !== 'notAll') {
        this.$reset()
        useAddressVermins().resetState()
        useConstants().resetState()
        useComparison().resetState()
      }
      objectsFiltersStore().resetState()
      referencesFiltersStore().resetState()
      useBModal().resetState()
      useObjectStore().resetState()
      useMapStore().resetState()
      useCalculations().resetState()
      useGeoObject().resetState()
      useHistoryOffers().resetState()
      useHistoryEstimation().resetState()
      useObjectModelTable().resetState()
      useCatalogsTable().resetState()
      useGeoTsofs().resetState()
      useDisplayCompareObject().resetState()
    },
    setErrorModal(bool: boolean) {
      this.errorModal = bool
    },
    setErrorModalText(value: string | null) {
      this.errorModalText = value
    },
    setToast(value: string, type: string, sec: number) {
      const toastsKeys = Object.keys(this.toasts)
      const index = toastsKeys.length ? Number(toastsKeys[toastsKeys.length - 1]) + 1 : 1
      this.toasts[index] = { type, value }
      setTimeout(() => {
        delete this.toasts[index]
      }, sec * 1000)
    },
    setToastMessage(err: any, type = 'error', sec = 10) {
      if (type === 'error' && err instanceof Error) {
        const responseError = err as { response?: { _data: unknown } }
        if (responseError.response) {
          this.setToast(JSON.stringify(responseError.response._data, null, 2), type, sec)
        } else {
          this.setToast(err.message, type, sec)
        }
      } else if (['message'].includes(type)) {
        this.setToast(err, type, sec)
      } else {
        this.setToast('Неизвестная ошибка', type, sec)
      }
    },
    setPage(value: string) {
      this.page = value
    },
    async getAllUsers(): Promise<any> {
      if (this.allUsers.length) {
        return this.allUsers
      }
      if (this.isLoadingAllUsers && this.allUsersPromise) {
        return this.allUsersPromise
      }
      this.isLoadingAllUsers = true
      this.allUsersPromise = $http
        .get(api_users)
        .then((res: Record<string, any>) => {
          this.allUsers = res._data.sort((a: any, b: any) => a.first_name.localeCompare(b.first_name))
          return res._data.sort((a: any, b: any) => a.first_name.localeCompare(b.first_name))
        })
        .catch((err: any) => {
          console.error(err)
        })
        .finally(() => {
          this.isLoadingAllUsers = false
          this.allUsersPromise = null
        })
      return this.allUsersPromise
    },
    setOldPath(route: any) {
      this.oldPath = route
    },
    setNewPath(route: any) {
      this.newPath = route
    },
    setEvaluationComponent(value: string) {
      this.evaluationComponent = value
    },
    async getModifiedByUserRealties(userId: number, monthAgo: string, today: string) {
      const { _data } = await $http.get(getModifiedByUserRealtiesUrl(userId, monthAgo, today))
      this.modifiedByUserRealties = _data.results
      this.modifiedByUserRealtiesCount = _data.rows
      return _data.results
    },
    async patchUserData(id: unknown, data: any = {}) {
      try {
        const { _data } = await $http.patch(api_user + id + '/', { body: data })
        return _data.user
      } catch (err) {
        console.log(err)
      }
    },
    async deleteUserPhoto(id: number) {
      try {
        const body = { delete_photo: true }
        await $http.patch(api_user_profile + id + '/', { body })
        const { _data } = await $http.get(api_user)
        return _data.user
      } catch (err) {
        console.log(err)
      }
    },
    setModeOfPage(mode: string) {
      this.modeOfPage = mode
    },
    setCalcTypeForPage(calcType: string) {
      this.calcTypeForPage = calcType
    },
    setPageLoading(loading: boolean) {
      this.pageLoading = loading
    },
  },
})
