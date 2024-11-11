import { defineStore } from 'pinia'
import { isEmpty } from 'lodash'
import { DISTANCE_, _DESCR } from '~/app_constants/geoTsofTable'
import useConstants from '~/store/constants'
import objectStore from '~/store/objectStore'
import geoObject from '~/store/geoObject'
import type { geoTsofObjectType } from '~/types/geoTsofTableTypes'

import { api_route, api_update_distances } from '~/app_constants/api'
import type { objectDataType } from '~/types/geoObjectTypes'

export interface GeoTsofsInterface {
  geoTsofObject: Array<geoTsofObjectType>
  isShowStub: boolean
  activeGeoTsofItem: geoTsofObjectType | null
  isFullScreen: boolean
  realtyObjectRealtyCards: objectDataType | null
}

export default defineStore('geoTsofs', {
  state: () =>
    ({
      geoTsofObject: [],
      isShowStub: false,
      activeGeoTsofItem: null,
      isFullScreen: false,
      realtyObjectRealtyCards: null,
    }) as GeoTsofsInterface,
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
    setActiveGeoTsofItem(item: geoTsofObjectType) {
      this.activeGeoTsofItem = item
    },
    async setGeoTsofObject(lon: number, lat: number, isLinkedRealEstate: boolean, isGeoObject: boolean) {
      this.geoTsofObject = []
      const serverOptions: Record<string, any> = await useConstants().getRealtyObjectOptions()
      console.log(objectStore().mutableData)
      const RealtyObjectRealtyCards: objectDataType = !isGeoObject
        ? isLinkedRealEstate
          ? await useConstants().getRealtyObjectRealtyCards(objectStore().id, null)
          : await useConstants().getRealtyObjectRealtyCards(null, { lon: lon, lat: lat })
        : geoObject().objectData

      if (isEmpty(RealtyObjectRealtyCards)) return
      this.realtyObjectRealtyCards = RealtyObjectRealtyCards
      if (!this.realtyObjectRealtyCards.geo_pos) {
        this.realtyObjectRealtyCards.geo_pos = {
          type: 'Point',
          coordinates: [lon, lat],
        }
      }
      const pricingFactors: string[] = Object.keys(serverOptions)
        .filter((item) => item.includes(DISTANCE_))
        .filter((factor) => Object.keys(RealtyObjectRealtyCards).includes(`${factor}${_DESCR}`))

      const pricingFactorsContentKeys: string[] = []
      pricingFactors.forEach((factor) => {
        pricingFactorsContentKeys.push(`${factor}${_DESCR}`)
      })
      for (let i = 0; i < pricingFactors.length; i++) {
        if (!RealtyObjectRealtyCards[pricingFactorsContentKeys[i]]) continue
        const obj: geoTsofObjectType = {
          pricing_factor: pricingFactors[i],
          label: serverOptions[pricingFactors[i]].label,
          type: RealtyObjectRealtyCards[pricingFactorsContentKeys[i]].type,
          all_types: RealtyObjectRealtyCards[pricingFactorsContentKeys[i]].all_types,
          address: RealtyObjectRealtyCards[pricingFactorsContentKeys[i]].address,
          name: RealtyObjectRealtyCards[pricingFactorsContentKeys[i]].name,
          point: RealtyObjectRealtyCards[pricingFactorsContentKeys[i]].point,
          start_point: RealtyObjectRealtyCards[pricingFactorsContentKeys[i]].start_point,
          source: RealtyObjectRealtyCards.name ? RealtyObjectRealtyCards.name : 'OSM',
          source_address: RealtyObjectRealtyCards.address_raw,
          pricing_factor_name: RealtyObjectRealtyCards[pricingFactorsContentKeys[i]].name,
        }

        await this.getRoute(obj, RealtyObjectRealtyCards)

        this.geoTsofObject.push(obj)
      }

      this.setActiveGeoTsofItem(this.geoTsofObject[0])
    },

    async getRoute(obj: geoTsofObjectType, RealtyObjectRealtyCards: Record<string, any>) {
      if (!obj.point) return
      const matchCosting: Record<string, any> = {
        by_car: 'auto',
        by_foot: 'pedestrian',
      }
      const { $routingServer } = useNuxtApp()

      const startPointGeojsonLike = obj.start_point
        ? {
            type: 'Point',
            coordinates: [obj.start_point[1], obj.start_point[0]],
          }
        : RealtyObjectRealtyCards.geo_pos

      const startPointLatLonLike = obj.start_point
        ? {
            lat: obj.start_point[0],
            lon: obj.start_point[1],
          }
        : {
            lat: RealtyObjectRealtyCards.geo_pos.coordinates[1],
            lon: RealtyObjectRealtyCards.geo_pos.coordinates[0],
          }

      if (matchCosting[obj.type]) {
        const routeParams = {
          locations: [
            startPointLatLonLike,
            {
              lat: obj.point[0],
              lon: obj.point[1],
            },
          ],
          costing: matchCosting[obj.type],
        }
        const json = JSON.stringify(routeParams)
        // const resp = await $http.get($routingServer + api_route + json)
        const resp = await fetch($routingServer + api_route + json, { method: 'GET' }).then((response) =>
          response.json(),
        )

        obj.shape = {
          startPoint: startPointGeojsonLike,
          endPoint: {
            type: 'Point',
            coordinates: [obj.point[1], obj.point[0]],
          },
          route: resp.trip.legs[0].shape,
        }
      } else {
        obj.shape = {
          startPoint: startPointGeojsonLike,
          endPoint: {
            type: 'Point',
            coordinates: [obj.point[1], obj.point[0]],
          },
          route: 'LineString',
        }
      }
    },

    async refreshGeoTsof(isLinkedRealEstate: boolean, isGeoObject: boolean) {
      if (!isLinkedRealEstate && !isGeoObject) return
      const { $geoObject } = useNuxtApp()
      console.log('before', geoObject().objectData)
      this.isShowStub = true
      const newData = await $http
        .post(api_update_distances, {
          body: {
            realty_object: isGeoObject ? $geoObject.objectData.id : this.realtyObjectRealtyCards?.id,
          },
        })
        .then((res) => res._data)
        .catch((error) => {
          console.log(error)
        })
      if (geoObject().objectData.id) {
        const serverOptions: Record<string, any> = await useConstants().getRealtyObjectOptions()
        const pricingFactors: string[] = Object.keys(serverOptions)
          .filter((item) => item.includes(DISTANCE_))
          .filter((factor) => Object.keys(newData).includes(`${factor}${_DESCR}`))

        const pricingFactorsContentKeys: string[] = []
        pricingFactors.forEach((factor) => {
          pricingFactorsContentKeys.push(`${factor}${_DESCR}`)
        })
        for (let i = 0; i < pricingFactors.length; i++) {
          geoObject().objectData[pricingFactors[i]] = newData[pricingFactors[i]]
          geoObject().objectData[pricingFactorsContentKeys[i]] = newData[pricingFactorsContentKeys[i]]
        }
        console.log('after', geoObject().objectData, newData, pricingFactorsContentKeys, pricingFactors)
      }
    },
  },
})
