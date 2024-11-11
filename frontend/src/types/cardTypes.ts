export type menuSideBarStructureType = tabType[]
export type tabsStructureType = constTabType[]

export type sectionType = {
  // Отображаемое имя секции
  name: string
  // Класс для строки секции
  sectionClass: string | string[]
  // Класс для отображения иконки секции
  sectionIcon: string
  // ID для строки секции
  sectionId: string
  // Обработчик клика
  handleSectionClick: (section: string, tabName: string) => void
}

export type constSectionType = {
  // Отображаемое имя секции
  name: string
}

export type constTabType = {
  // Отображаемое имя таба
  tab: string
  // Вложенные секции таба
  sections: constSectionType[]
  // Является ли таб константным
  isConst: boolean
  // Индикатор отсутствия секции. Возможно, стоит отказаться, т.к. по сути информация содержится в sections
  onlyHead: boolean
  // Интерпритация вложенных секций как один компонент
  customSectionBehavior: boolean
}

export type tabType = constTabType & {
  // Индикатор отображения таба (если, например, данные подхватываются динамически и нужно скрывать неготовые табы)
  toShow: boolean
  // Класс для строки таба
  tabClassName: string | string[]
  // Класс для отображения иконки таба
  tabIcon: string
  // ID для строки таба
  tabId: string
  // Индикатор отображения вложенных секций
  toShowSections: boolean
  // Вложенные секции
  sections: sectionType[]
  // Обработчик клика
  handleTabClick: (tab: string) => void
}

export type menuSideBarDesignationType = {
  icon: string
  name: string
}[]

export type headerDesignationType = {
  title: string
  infoList: headerInfoItemType[]
}

export type headerInfoItemType = {
  title: string
  info: string
  clickHandler?: () => void
  showTooltip?: boolean
}
