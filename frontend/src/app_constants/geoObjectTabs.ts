export const mergedFields = 'Стандартные поля'
export const nestedObjects = 'Вложенные объекты и карточки'
export const geoTsof = 'Анализ локации'
export const geoLayer = 'Объекты гео-слоёв'
export const locationAccessibility = 'Доступность локации'
export const photo = 'Фотографии'
export const documents = 'Документы'
export const evaluationHistory = 'История оценки'
export const offerHistory = 'История предложения'
export const baseFields = 'Базовые поля'
export const standartFields = 'Основные'
export const loactionFields = 'Местоположение'
export const communicationFields = 'Коммуникации'
export const otherFields = 'Прочие'
export const landplotFields = 'Земельный участок'
export const landplotCharacterisitcs = 'Характеристики ЗУ'

export const allTypesConstTabs = [
  mergedFields,
  nestedObjects,
  geoTsof,
  photo,
  documents,
  evaluationHistory,
  offerHistory,
]

export const weights: Record<string, any> = {
  [mergedFields]: 100,
  [nestedObjects]: 90,
  [geoTsof]: 80,
  [photo]: 70,
  [documents]: 60,
  [evaluationHistory]: 50,
  [offerHistory]: 40,
}

export const childSections: Record<string, string[]> = {
  [mergedFields]: [
    baseFields,
    standartFields,
    loactionFields,
    communicationFields,
    landplotFields,
    otherFields,
    landplotCharacterisitcs,
  ],
  [geoTsof]: [locationAccessibility, geoLayer],
}

export const customSectionBehavior = [mergedFields]

export const createEvaluation = 'Добавление новой оценки'
export const createAnalog = 'Добавление нового предложения'
export const createResearch = 'Добавление нового НЭИ'
export const linkExistingCard = 'Привязка карточек к объекту'
export const linkExistingObject = 'Привязка объектов к объекту'
export const additionalUnshownTabsForBreadCrumb = [
  createEvaluation,
  createAnalog,
  createResearch,
  linkExistingObject,
  linkExistingCard,
]

export const hashCorrectionMap: Record<string, string> = {
  [createEvaluation]: nestedObjects,
  [createAnalog]: nestedObjects,
  [createResearch]: nestedObjects,
  [linkExistingCard]: nestedObjects,
}
