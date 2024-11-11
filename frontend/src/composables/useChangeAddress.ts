import { ref } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { isOsmBuilding } from '~/app_constants/geoInfoLists'

export function useChangeAddress(
  mutableData: { [key: string]: any },
  emit: (event: 'updateMutableData' | 'buildingNotFound', ...args: any[]) => void,
  onlyBuildings = false,
) {
  const { $searchServer } = useNuxtApp()
  const addressLoading = ref(false)
  let loadController: AbortController | null = null

  async function changeAddress() {
    console.log(mutableData.geo_pos.coordinates[1] + '&lon=' + mutableData.geo_pos.coordinates[0])
    if (loadController) {
      loadController.abort('SearchAddressInput: started new loading session')
    }
    loadController = new AbortController()
    let nmResponse: any[] = []
    addressLoading.value = true

    try {
      // @ts-ignore
      const response = await $http.get(
        `${$searchServer}/reverse.php?lat=${mutableData.geo_pos.coordinates[1]}&lon=${mutableData.geo_pos.coordinates[0]}&addressdetails=1&format=jsonv2&accept-language=ru&limit=10&polygon_geojson=1`,
        { signal: loadController.signal },
      )
      nmResponse = [response._data]

      console.log(nmResponse)
      if (onlyBuildings) {
        nmResponse = nmResponse.filter((item) => isOsmBuilding(item))
      }
      console.log(nmResponse, nmResponse.length)
      if (!nmResponse.length && onlyBuildings) {
        emit('buildingNotFound')
      } else if (nmResponse.length) {
        emit(
          'updateMutableData',
          'address_raw',
          nmResponse.length ? nmResponse[0].display_name.split(',').reverse().join(',') : '',
        )
        emit('updateMutableData', 'address_and_coord', {
          lngLat: {
            lng: mutableData.geo_pos.coordinates[0],
            lat: mutableData.geo_pos.coordinates[1],
          },
          address: nmResponse.length ? nmResponse[0].display_name.split(',').reverse().join(',') : '',
          osm_id: nmResponse[0].osm_id,
          geo_json: nmResponse[0].geojson,
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      addressLoading.value = false
    }
  }

  return { changeAddress, addressLoading }
}
