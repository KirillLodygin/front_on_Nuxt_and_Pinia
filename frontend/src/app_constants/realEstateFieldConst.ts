export const scenario = {
  Q: [
    { title: 'Базовые поля', fields: [['name'], ['description'], ['object_type', 'func_purpose']] },
    {
      title: 'Основные',
      fields: [['kadast_number', 'object_area']],
    },
    {
      title: 'Местоположение',
      fields: [['osm_id'], ['address_raw'], ['coordinates_component']],
    },
    {
      title: 'Коммуникации',
      fields: [
        ['engineering_electricity', 'engineering_water'],
        ['engineering_heat', 'engineering_severage'],
      ],
    },
    {
      title: 'Прочие',
      fields: [
        ['floor_count', 'realty_class'],
        ['floor_number'],
        ['condition_finish', 'celling_height'],
        ['entrance_type'],
      ],
    },
  ],
  B: [
    { title: 'Базовые поля', fields: [['name'], ['description'], ['object_type', 'func_purpose']] },
    {
      title: 'Основные',
      fields: [
        ['kadast_number', 'object_area'],
        ['object_offices_area', 'object_trade_area'],
        ['object_common_area', 'object_storage_area'],
      ],
    },
    {
      title: 'Местоположение',
      fields: [
        ['osm_id'],
        ['address_raw'],
        ['coordinates_component'],
        ['settlement_status'],
        ['position_inside_city', 'position_highway'],
        ['center_region_distance', 'center_city_distance'],
        ['metro_distance'],
      ],
    },
    {
      title: 'Коммуникации',
      fields: [
        ['engineering_electricity', 'engineering_water'],
        ['engineering_heat', 'engineering_severage'],
      ],
    },
    {
      title: 'Земельный участок',
      fields: [['kadast_number_land_nei'], ['land_category', 'land_permitted_use'], ['land_area']],
    },
    {
      title: 'Прочие',
      fields: [
        ['floor_count'],
        ['realty_class', 'walls_material'],
        ['tech_status'],
        ['access_type', 'parking_type'],
        ['cold_camera', 'has_lifting_mechanisms'],
        ['railways', 'border'],
      ],
    },
  ],
  L: [],
}

export const writableFieldsEmpty = ['name', 'description', 'object_type', 'address_raw', 'coordinates_component']
export const requiredFieldsEmpty = ['name', 'object_type', 'address_raw', 'coordinates_component']

export const writableFields = ['name', 'description']
export const requiredFields = ['name']

export const postFieldsEmpty = ['name', 'description', 'object_type', 'address_raw', 'geo_pos', 'geo_obj', 'osm_id']
export const postFields = ['name', 'description']

export const customObjectData: Record<string, any> = {
  name: {
    objectData: {
      choices: [],
      label: 'Название',
      type: 'string',
      max_length: 250,
    },
    flags: { requiredField: true },
  },
  osm_id: {
    objectData: {
      choices: [],
      label: 'Привязка к OSM (ID)',
      type: 'string',
      max_length: 255,
    },
    flags: { requiredField: true },
  },
  object_type: {
    objectData: {
      choices: [
        {
          value: 'Q',
          display_name: 'Помещение',
        },
        {
          value: 'B',
          display_name: 'Здание',
        },
        {
          value: 'L',
          display_name: 'Земельный участок',
        },
      ],
      label: 'Тип объекта',
      type: 'choice',
    },
    flags: { requiredField: true, isCube: true },
  },
  address_raw: {
    objectData: {
      choices: [],
      label: 'Адрес',
      type: 'string',
      max_length: 255,
    },
    flags: { requiredField: true, findMap: 'Найти на карте' },
  },
  parent: {
    objectData: { choices: [], label: 'Расположен', type: 'string', max_length: 255 },
    flags: { requiredField: false },
  },
  description: {
    objectData: { choices: [], label: 'Описание', type: 'string' },
    flags: { requiredField: false },
  },
  // parent:{
  //   choices: [],
  //     label: 'Расположен',
  //     type: 'string',
  //     max_length: 255,
  // }
}

export const getСustomEmptyObjectData = (name: string) => {
  return {
    objectData: {
      choices: [],
      label: name,
      type: 'string',
      max_length: 255,
    },
    flags: { requiredField: false },
  }
}

export const writableFieldsCreateObject = ['name', 'description']
export const requiredFieldsCreateObject = ['name']
export const postFieldsCreateObject = [
  'name',
  'description',
  'object_type',
  'address_raw',
  'geo_pos',
  'geo_obj',
  'osm_id',
]
export const scenarioCreateObjectFromModal = [
  ['name'],
  ['description'],
  ['parent', 'osm_id'],
  ['address_raw'],
  ['coordinates_component'],
]

export const scenarioCreateObject = [
  {
    title: 'Базовые поля',
    fields: [['name', 'osm_id'], ['description'], ['address_raw'], ['coordinates_component']],
  },
]

export const objectTypeCalcToText: Record<string, any> = {
  OO: 'Оценка',
  NE: 'Исследование',
  OA: 'Предложение',
}

export const objectTypeToText: Record<string, any> = {
  B: 'Здание',
  Q: 'Помещение',
  L: 'Земельный участок',
}

export const objectTypeCalcToTextDeclined: Record<string, any> = {
  OO: 'оценки',
  NE: 'исследования',
  OA: 'предложения',
}
