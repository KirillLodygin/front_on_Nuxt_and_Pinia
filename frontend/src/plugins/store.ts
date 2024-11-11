import useUserStore from '~/store/userStore'
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
import useUserProfile from '~/store/userProfile'

export default defineNuxtPlugin((nuxtApp) => {
  const userStore = useUserStore()
  const filtersStore = objectsFiltersStore()
  const refsFiltersStore = referencesFiltersStore()
  const bvModal = useBModal()
  const objectStore = useObjectStore()
  const mapStore = useMapStore()
  const addressVermins = useAddressVermins()
  const calculations = useCalculations()
  const constData = useConstants()
  const geoObject = useGeoObject()
  const historyOffers = useHistoryOffers()
  const historyEstimation = useHistoryEstimation()
  const objectModelTable = useObjectModelTable()
  const catalogsTable = useCatalogsTable()
  const geoTsofs = useGeoTsofs()
  const comparison = useComparison()
  const displayCompareObjectStore = useDisplayCompareObject()
  const userProfile = useUserProfile()
  return {
    provide: {
      userStore,
      filtersStore,
      refsFiltersStore,
      bvModal,
      objectStore,
      mapStore,
      addressVermins,
      calculations,
      constData,
      geoObject,
      historyOffers,
      historyEstimation,
      objectModelTable,
      catalogsTable,
      geoTsofs,
      comparison,
      displayCompareObjectStore,
      userProfile,
    },
  }
})
