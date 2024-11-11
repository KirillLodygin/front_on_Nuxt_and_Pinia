import type { Point } from 'geojson'
import _cloneDeep from 'lodash/cloneDeep'
import {
  api_realty_objects,
  api_link_cards,
  api_link_objects,
  api_update_distances,
  api_get_realty_objects_in_coords,
  api_fix_realty_object_paths,
} from '~/app_constants/api'
import type { objectDataType } from '~/types/geoObjectTypes'
import type { objectTypeType } from '~/types/mapObjectPropertiesTypes'
// data - fields
// metaScenario - fields_groups
// mutableOptions - options объекта
// mutableData - сам объект
export const createAimObjectFields = (
  data: { [key: string]: any }[],
  metaScenario: { [key: string]: any },
  mutableOptions: { [key: string]: any },
  mutableData: { [key: string]: any },
): { fields: { [key: string]: any }[]; fieldsForStageOne: string[] } => {
  const tabsList = ['Стандартные поля', 'ПЗЗ', 'Базовые поля']
  let displayedFields: string[] = []
  tabsList.forEach((item) => {
    if (metaScenario[item]) {
      displayedFields.push(...metaScenario[item].map((item: any) => item.fields).flat(Infinity))
    }
  })
  let evoluationMutableData: { [key: string]: any }[] = []
  data.forEach((item) => {
    // if (!mutableOptions[item.name] && !item.flags) {
    //   return
    // }
    // console.log(item.name)

    if (mutableOptions[item.name] || item.field_type) {
      evoluationMutableData.push({
        ...item,
        type: item.field_type && item.field_type !== 'None' ? item.field_type : mutableOptions[item.name]?.type,
        objectData: {
          ...mutableOptions[item.name],

          label: item.label ? item.label : mutableOptions[item.name]?.label,
          type: item.field_type && item.field_type !== 'None' ? item.field_type : mutableOptions[item.name]?.type,

          choices: mutableOptions[item.name]?.type === 'choice' ? item.choices : [],
        },
      })
    } else {
      evoluationMutableData.push({
        ...item,
      })
    }
  })

  const exclude = [
    'object_type',
    'func_purpose',
    'ads_type',
    'ne_ads_type',
    'exchange_type',
    'offer_date',
    'object_area',
    'object_area_source',
    'object_area_source_dim',
    'price_sale',
    'price_sale_per_m',
    'price_sale_source',
    'price_sale_source_type',
    'object_offices_area',
    'object_common_area',
    'object_trade_area',
    'object_storage_area',
    'object_offices_area_share',
    'object_common_area_share',
    'object_trade_area_share',
    'object_storage_area_share',
    'rent_result_json',
    'enrichment_begin',
    'enrichment_end',
  ]
  evoluationMutableData = evoluationMutableData.filter((item) => {
    return !(
      item.flags.requiredField &&
      !displayedFields.includes(item.name) &&
      !exclude.includes(item.name) &&
      mutableOptions[item.name]
    )
  })

  let evoluationMutableOptions = createMutableOptionsObject(evoluationMutableData)

  const newCurrentFields = evoluationMutableData.map((item) => {
    // if (item.field === 'land_rights') {
    //   console.log(item, mutableOptions[item.field].choices)
    // }
    // console.log(item)
    if (!evoluationMutableOptions[item.name]) {
      // console.log(item, mutableOptions[item.field].choices)
      return _cloneDeep({
        ...item,
        value: '',
        ...evoluationMutableOptions[item.name]?.flags,
        field: evoluationMutableOptions[item.name].name,
      })
    } else if (evoluationMutableOptions[item.name].type === 'choice') {
      return _cloneDeep({
        ...item,

        label: evoluationMutableOptions[item.name].label,
        type: evoluationMutableOptions[item.name].type,
        choices: evoluationMutableOptions[item.name].objectData.choices,
        field: evoluationMutableOptions[item.name].name,
        // showCorrectionFactor: evoluationMutableOptions[item.name]?.flags.requiredField ? false : true,
        // isShownCorrectionFactor: evoluationMutableOptions[item.name]?.flags.requiredField ? false : true,
        ...evoluationMutableOptions[item.name]?.flags,
      })
    } else
      return _cloneDeep({
        ...item,

        label: evoluationMutableOptions[item.name]?.label,
        type: evoluationMutableOptions[item.name]?.type,
        field: evoluationMutableOptions[item.name].name,
        // showCorrectionFactor: evoluationMutableOptions[item.name]?.flags.requiredField ? false : true,
        // isShownCorrectionFactor: evoluationMutableOptions[item.name]?.flags.requiredField ? false : true,
        ...evoluationMutableOptions[item.name]?.flags,
      })
  })

  if (mutableData.object_type === 'Q' && mutableData.floor_number && Object.keys(mutableData.floor_number)) {
    const floors = Object.keys(mutableData.floor_number).filter((item) => item.includes('TR'))
    if (floors.length > 1) {
      for (let i = 1; i < floors.length + 1; i++) {
        newCurrentFields.push({
          field: `third_floor_and_above_location_coefficient_${i}`,
          label: 'Коэффициент на расположение на третьем этаже и выше',
          virtual: true,
        })
      }
    }
  }

  return {
    fields: newCurrentFields.filter(
      (item) =>
        // item.field !== 'date_calc' &&
        item.field !== 'rent_result_json' && item.field !== 'enrichment_begin' && item.field !== 'enrichment_end',
    ),
    fieldsForStageOne: displayedFields,
  }
}

function createMutableOptionsObject(mutableOptionsArr: object[]) {
  const obj: { [key: string]: any } = {}
  mutableOptionsArr.forEach((item: any) => {
    obj[item.name] = {
      ...item,
    }
  })
  console.log(obj)
  return obj
}

export const reformatDate = (date: string) => {
  const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return date ? new Date(date).toLocaleDateString('ru-RU', dateOptions) : '-'
}

export const getUserNames = (user: Record<string, any>) => {
  return user && Object.keys(user).length ? user.first_name + ' ' + user.last_name : ''
}

export const createCardLinkToRealtyObject = async (parentId: number, childId: number) => {
  const body = {
    add_cards: [childId],
    target_id: parentId,
  }
  const data: objectDataType = await $http
    .post(api_realty_objects + api_link_cards, { body: body })
    .then((res: Record<string, any>) => res._data)
  console.log(data)
  return data
}

export const createRealtyObjectLinkToRealtyObject = async (parentId: number, childId: any) => {
  const body = {
    target_ids: [childId],
    parent_id: parentId,
  }
  const data: objectDataType = await $http
    .post(api_realty_objects + api_link_objects, { body: body })
    .then((res: Record<string, any>) => res._data)
  console.log(data)
  return data
}

export const updateDistances = async (id: any) => {
  const response = await $http.post(api_update_distances, {
    body: { realty_object: id },
  })
  return response._data
}

export const getFirstRealtyObjectByCoordAndType = async (lat: number, lon: number, objectType: objectTypeType) => {
  const response = await $http.get(api_get_realty_objects_in_coords, {
    params: {
      lat: lat,
      lon: lon,
      radius: 5,
      limit: 10,
      object_type: objectType,
    },
  })
  const filtred = response._data.filter((item: Record<string, any>) => item.object_type === objectType)
  return filtred[0]
}

export const createLandplotRealtyObjectBasedOnBuilding = async (id: any, point: Point, addressRaw: string) => {
  const objectData = {
    name: 'Земельный участок на основе здания #' + id,
    address_raw: addressRaw,
    osm_id: 0,
    geo_pos: point,
    geo_obj: point,
    object_type: 'L',
    description: `Объект недвижимости создан на основе карточки #${id}`,
  }
  let respData
  try {
    respData = await $http.post(api_realty_objects, { body: objectData }).then((res: Record<string, any>) => res)
  } catch (e: any) {
    if (e.status === 500) {
      await $http.get(api_fix_realty_object_paths)
      respData = await $http.post(api_realty_objects, { body: objectData }).then((res: Record<string, any>) => res)
    }
  }
  const data = respData?._data
  return data
}

export const createBuildingRealtyObjectBasedOnQuarter = async (id: any, point: Point, addressRaw: string) => {
  const objectData = {
    name: 'Здание на основе помещения #' + id,
    address_raw: addressRaw,
    osm_id: 0,
    geo_pos: point,
    geo_obj: point,
    object_type: 'B',
    description: `Объект недвижимости создан на основе помещения #${id}`,
  }
  let respData
  try {
    respData = await $http.post(api_realty_objects, { body: objectData }).then((res: Record<string, any>) => res)
  } catch (e: any) {
    if (e.status === 500) {
      await $http.get(api_fix_realty_object_paths)
      respData = await $http.post(api_realty_objects, { body: objectData }).then((res: Record<string, any>) => res)
    }
  }
  const data = respData?._data
  return data
}
