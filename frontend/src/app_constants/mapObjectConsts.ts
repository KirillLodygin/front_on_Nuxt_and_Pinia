export const baseFields = 'Базовые поля'
export const standartFields = 'Стандартные поля'
export const pzz = 'ПЗЗ'
export const geoTsof = 'Анализ локации'
export const photo = 'Фотографии'
export const documents = 'Документы'
export const geoLayer = 'Объекты гео-слоёв'
export const history = 'История'
export const evaluation = 'Расчёты'
export const factors = 'Доп. ЦОФ'
export const trade = 'Торги'
export const research = 'Исследование'
export const development = 'Анализ окружающей застройки'
export const deal = 'Сделка с ОН'
export const locationAccessibility = 'Доступность локации'

export const allTypesConstTabs = [geoTsof, photo, documents, history]
export const evaluationConstTabs = [evaluation, factors]
export const researchConstTabs = [trade, research, development]
export const analogsConstTabs = [deal]

export const weights: Record<string, any> = {
  [baseFields]: 100,
  [standartFields]: 90,
  [factors]: 89,
  [pzz]: 88,
  [deal]: 87,
  [geoTsof]: 86,
  [photo]: 81,
  [documents]: 80,
  [trade]: 70,
  [evaluation]: 70,
  [development]: 69,
  [research]: 68,
  [geoLayer]: 60,
  [history]: 50,
}

export const excludedSectionsForToggle = [geoLayer, research]

export const childSections: Record<string, string[]> = {
  [geoTsof]: [locationAccessibility, geoLayer],
}

export const customSectionBehavior = [standartFields]
