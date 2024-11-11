import { defineStore } from 'pinia'
import _cloneDeep from 'lodash/cloneDeep'
import type { objectDataType } from '~/types/geoObjectTypes'
import { api_route } from '~/app_constants/api'
import type { geoTsofObjectType } from '~/types/geoTsofTableTypes'

interface displayCompareStoreState {
  currentRealtyObject: Record<string, any> | null
  currentPricingFactor: string | null
  route: Record<string, any> | null
  isRouteLoading: boolean
  mapRerenderKey: number
}

export default defineStore('displayCompareStore', {
  state: () =>
    <displayCompareStoreState>{
      currentRealtyObject: null,
      currentPricingFactor: null,
      route: null,
      isRouteLoading: false,
      mapRerenderKey: 0,
    },
  getters: {},

  actions: {
    resetState() {
      this.$reset()
    },
    async setCurrentRealtyObject(obj: Record<string, any>) {
      this.currentRealtyObject = { ...obj }
      if (this.currentPricingFactor && this.currentRealtyObject[this.currentPricingFactor + '_descr']) {
        this.isRouteLoading = true
        console.log('getRoute setCurrentRealtyObject', this.currentRealtyObject, this.currentPricingFactor)
        this.route = await this.getRoute(
          this.currentRealtyObject[this.currentPricingFactor + '_descr'],
          this.currentRealtyObject,
        )
        this.isRouteLoading = false
      }
    },
    async setCurrentPricingFactor(factor: string) {
      this.currentPricingFactor = factor
      if (
        this.currentRealtyObject &&
        Object.keys(this.currentRealtyObject).length &&
        this.currentRealtyObject[this.currentPricingFactor + '_descr']
      ) {
        this.isRouteLoading = true
        console.log('getRoute setCurrentPricingFactor', this.currentRealtyObject, this.currentPricingFactor)
        this.route = await this.getRoute(
          this.currentRealtyObject[this.currentPricingFactor + '_descr'],
          this.currentRealtyObject,
        )
        this.isRouteLoading = false
      }
    },
    async getRoute(
      obj: Record<string, any>,
      RealtyObjectRealtyCards: Record<string, any>,
    ): Promise<Record<string, any> | null> {
      if (!obj.point) return null
      const matchCosting: Record<string, any> = {
        by_car: 'auto',
        by_foot: 'pedestrian',
      }
      const { $routingServer } = useNuxtApp()
      if (matchCosting[obj.type]) {
        const routeParams = {
          locations: [
            {
              lat: RealtyObjectRealtyCards.geo_pos.coordinates[1],
              lon: RealtyObjectRealtyCards.geo_pos.coordinates[0],
            },
            {
              lat: obj.point[0],
              lon: obj.point[1],
            },
          ],
          costing: matchCosting[obj.type],
        }
        const json = JSON.stringify(routeParams)
        console.log(json)
        // const resp = await $http.get($routingServer + api_route + json)
        const resp = await fetch($routingServer + api_route + json, { method: 'GET' }).then((response) =>
          response.json(),
        )

        return {
          startPoint: RealtyObjectRealtyCards.geo_pos,
          endPoint: {
            type: 'Point',
            coordinates: [obj.point[1], obj.point[0]],
          },
          route: resp.trip.legs[0].shape,
          name: obj.name,
          address: obj.address,
        }
      } else {
        return {
          startPoint: RealtyObjectRealtyCards.geo_pos,
          endPoint: {
            type: 'Point',
            coordinates: [obj.point[1], obj.point[0]],
          },
          route: 'LineString',
          name: obj.name,
          address: obj.address,
        }
      }
    },
  },
})
