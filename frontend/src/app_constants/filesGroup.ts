import type { FileGroup } from '~/types/mapObjectPropertiesTypes'
import { photo as photoTab, documents as documentsTab, documents } from './mapObjectConsts'

const root = 'Общее'
export const screenShots = 'Снимки экрана'
const photo = 'Фотографии'
const enters = 'Входы'
const environment = 'Окружение'
const floorPlan = 'Поэтажный план'
const files = 'Файлы'
const pzz = 'ПЗЗ'
const genPlan = 'Генплан'
const buildingEntrance = 'Вход в здание'
const hall = 'Холл'
// const quaterEntrance = "Вход в помещение"
// const buildingEnvironment = "Окружение (здание)"
const traffic = 'Трафик'
const developmentEnvironment = 'Окружение (застройка)'
const buildingFacade = 'Фасад здания'
const imagesLink = 'Другое'
const adsScreenshot = 'Снимок экрана по умолчанию'
export const documentsGroup = 'Документы'

export const pathToImagesLink = '/screenshots'
export const photosArr = [
  root,
  screenShots,
  photo,
  enters,
  environment,
  buildingEntrance,
  hall,
  developmentEnvironment,
  buildingFacade,
  imagesLink,
  floorPlan,
  pzz,
  genPlan,
  traffic,
  adsScreenshot,
]
export const filesArr = [documentsGroup]
export const filesGroupCard = {
  OO: {
    flags: {
      Q: {
        required: {
          [photoTab]: [],
          [documentsTab]: [],
        },
      },
      B: {
        required: {
          [photoTab]: [],
          [documentsTab]: [],
        },
      },
      L: {
        required: {
          [photoTab]: [],
          [documentsTab]: [],
        },
      },
    },
    Q: [root, photo, enters, floorPlan, files, pzz, documentsGroup],
    B: [root, photo, enters, floorPlan, files, pzz, documentsGroup],
    L: [root, photo, enters, floorPlan, files, pzz, genPlan, documentsGroup],
  },
  OA: {
    flags: {
      Q: {
        required: {
          [photo]: [screenShots],
          [documentsTab]: [],
        },
      },
      B: {
        required: {
          [photo]: [screenShots],
          [documentsTab]: [],
        },
      },

      L: {
        required: {
          [photo]: [screenShots],
          [documentsTab]: [],
        },
      },
    },

    Q: [root, screenShots, photo, enters, floorPlan, files, adsScreenshot, imagesLink, documentsGroup],
    B: [root, screenShots, photo, enters, floorPlan, files, adsScreenshot, imagesLink, documentsGroup],
    L: [root, screenShots, photo, enters, floorPlan, files, pzz, genPlan, adsScreenshot, imagesLink, documentsGroup],
  },
  NE: {
    flags: {
      Q: {
        required: {
          [photoTab]: [],
          [documentsTab]: [],
        },
      },
      B: {
        required: {
          [photoTab]: [],
          [documentsTab]: [],
        },
      },
      L: {
        required: {
          [photoTab]: [],
          [documentsTab]: [],
        },
      },
    },
    Q: [
      buildingFacade,
      buildingEntrance,
      hall,
      floorPlan,
      enters,
      photo,
      pzz,
      environment,
      traffic,
      developmentEnvironment,
      screenShots,
      files,
      documentsGroup,
    ],
    B: [
      buildingFacade,
      buildingEntrance,
      hall,
      floorPlan,
      enters,
      photo,
      pzz,
      environment,
      traffic,
      developmentEnvironment,
      screenShots,
      files,
      documentsGroup,
    ],
    L: [
      buildingFacade,
      buildingEntrance,
      hall,
      floorPlan,
      enters,
      photo,
      pzz,
      environment,
      traffic,
      developmentEnvironment,
      screenShots,
      files,
      documentsGroup,
    ],
  },
} as FileGroup

export const filesGroupObject = {
  OO: {
    flags: {
      Q: {
        required: {
          [photo]: [],
          [documentsTab]: [],
        },
      },
      B: {
        required: {
          [photo]: [],
          [documentsTab]: [],
        },
      },

      L: {
        required: {
          [photo]: [],
          [documentsTab]: [],
        },
      },
    },

    Q: [root, screenShots, photo, enters, floorPlan, files, documentsGroup],
    B: [root, screenShots, photo, enters, floorPlan, files, documentsGroup],
    L: [root, screenShots, photo, enters, floorPlan, files, pzz, genPlan, documentsGroup],
  },
  OA: {
    flags: {
      Q: {
        required: {
          [photo]: [],
          [documentsTab]: [],
        },
      },
      B: {
        required: {
          [photo]: [],
          [documentsTab]: [],
        },
      },

      L: {
        required: {
          [photo]: [],
          [documentsTab]: [],
        },
      },
    },

    Q: [root, screenShots, photo, enters, floorPlan, files, documentsGroup],
    B: [root, screenShots, photo, enters, floorPlan, files, documentsGroup],
    L: [root, screenShots, photo, enters, floorPlan, files, pzz, genPlan, documentsGroup],
  },
  NE: {
    flags: {
      Q: {
        required: {
          [photo]: [],
          [documentsTab]: [],
        },
      },
      B: {
        required: {
          [photo]: [],
          [documentsTab]: [],
        },
      },

      L: {
        required: {
          [photo]: [],
          [documentsTab]: [],
        },
      },
    },

    Q: [root, screenShots, photo, enters, floorPlan, files, documentsGroup],
    B: [root, screenShots, photo, enters, floorPlan, files, documentsGroup],
    L: [root, screenShots, photo, enters, floorPlan, files, pzz, genPlan, documentsGroup],
  },
} as FileGroup

export const filesExtByMode = {
  [photo]: ['jpeg', 'jpg', 'png', 'webp', 'svg'],
  [documents]: ['jpeg', 'jpg', 'png', 'webp', 'svg', 'pdf', 'docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp'],
}
