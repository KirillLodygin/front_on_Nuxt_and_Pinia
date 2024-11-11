// Файл: composables/useAddressSearch.ts

import { ref } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { isOsmBuilding, realtyObjectBuildingCategories } from '~/app_constants/geoInfoLists'

export function useAddressSearch() {
  const { $addressVermins, $searchServer, $mapStore, $mapObjectDefaults }: any = useNuxtApp()
  const loading = ref(false)
  let loadController: AbortController | null = null

  const getsaVariants = async (address: string, onlyBuildings: boolean, mapStore: Record<string, any>) => {
    if (address) {
      address = $addressVermins.analyzeAddress(address)

      loading.value = true

      if (loadController) {
        loadController.abort('SearchAddressInput: started new loading session')
      }
      loadController = new AbortController()

      mapStore.saVariants = []
      let nmResponse: any[] = []
      let nmResponseExtra: any[] = []
      const nmResponseIds: number[] = []

      try {
        nmResponse = await $http
          .get(
            `${$searchServer}search.php?q=${encodeURIComponent(address)}&addressdetails=1&format=jsonv2&accept-language=ru&limit=50&polygon_geojson=1`,
            { signal: loadController.signal },
          )
          .then((res) => res._data)

        nmResponse.forEach((variant) => {
          nmResponseIds.push(variant.place_id)
        })

        if (nmResponseIds.length > 0) {
          nmResponseExtra = await $http
            .get(
              `${$searchServer}/search.php?q=${encodeURIComponent(address)}&addressdetails=1&format=jsonv2&accept-language=ru&limit=50&polygon_geojson=1&exclude_place_ids=${nmResponseIds.toString()}`,
              { signal: loadController.signal },
            )
            .then((res) => res._data)

          nmResponse = nmResponse.concat(nmResponseExtra)
        }
        if (onlyBuildings) {
          nmResponse = nmResponse.filter((item) => isOsmBuilding(item))
        }
        nmResponse.forEach((variant) => {
          $mapObjectDefaults(variant)
        })

        nmResponse.sort((a, b) => (a.category === 'building' ? -1 : b.category === 'building' ? 1 : 0))

        mapStore.setSaVariants(nmResponse)
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    } else {
      mapStore.setSaVariants([])
    }
  }

  return { loading, getsaVariants }
}
