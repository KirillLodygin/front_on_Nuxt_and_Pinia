export const calcTypeToPath: Record<any, string> = {
  OO: 'evaluation',
  OA: 'analog',
  NE: 'research',
}
export default [
  { matchedPath: '/references', path: 'references', name: 'Справочники' },
  { matchedPath: '/catalog', path: 'catalog', name: 'Каталоги' },
  { matchedPath: '/compare', path: 'compare', name: 'Сравнение объектов недвижимости' },
  {
    matchedPath: '/compare/:compare_id()',
    path: 'compare/compare_id',
    name: 'Сравнение объектов недвижимости/',
  },
  { matchedPath: '/real_estate', path: 'real_estate', name: 'Объекты недвижимости' },
  {
    matchedPath: '/real_estate/:real_estate_id()',
    path: 'real_estate/real_estate_id',
    name: 'Объекты недвижимости/#',
  },
  { matchedPath: '/analog', path: 'analog', name: 'Сделки и предложения' },
  { matchedPath: '/analog/:analog_id()', path: 'analog/analog_id', name: 'Сделки и предложения/Предложение' },
  { matchedPath: '/evaluation', path: 'evaluation', name: 'Оценка' },
  { matchedPath: '/evaluation/:evaluation_id()', path: 'evaluation/evaluation_id', name: 'Оценка/Объект' },
  {
    matchedPath: '/evaluation/:evaluation_id()/results',
    path: 'evaluation/evaluation_id/results',
    name: 'Оценка/Объект/Расчёт',
  },
  {
    matchedPath: '/evaluation/:evaluation_id()/analogs_table',
    path: 'evaluation/evaluation_id/analogs_table',
    name: 'Оценка/Объект/Таблица предложений',
  },
  { matchedPath: '/research', path: 'research', name: 'Анализ объекта' },
  { matchedPath: '/research/:research_id()', path: 'research/research_id', name: 'Анализ объекта/Объект' },
  { matchedPath: '/map', path: 'map', name: 'Работа с картой' },
  { matchedPath: '/user', path: 'user', name: 'Пользователь' },
  { matchedPath: '/user/:user_id()', path: 'user/user_id', name: 'Пользователь/ID' },
]

type systemPathType = {
  title: string
  description: string
  iconClass: string
  path: string
  searchParams?: string
  additionalItems: {
    iconClass: string
    title: string
    path: string
    flags: Record<string, any>
  }[]
  flags: Record<string, any>
}

export const systemPaths: systemPathType[] = [
  {
    title: 'Оценка',
    description: 'Оценка объектов недвижимости, активов',
    iconClass: 'icon evaluation',
    path: '/evaluation',
    searchParams: '?mode=all',
    additionalItems: [
      { iconClass: 'icon fi_rotate-ccw', title: 'Ваши объекты', path: '/evaluation?mode=self', flags: {} },
      {
        iconClass: 'icon fi_grid',
        title: 'Все объекты оценки',
        path: '/evaluation?mode=all',
        flags: { openOnlyFor: 'IS' },
      },
    ],
    flags: { openOnlyFor: 'OO' },
  },
  {
    title: 'Анализ объекта',
    description: 'Аналитика окружающего и коммерческого потенциала',
    iconClass: 'icon nei',
    path: '/research',
    searchParams: '?mode=all',
    additionalItems: [
      { iconClass: 'icon fi_rotate-ccw', title: 'Ваши объекты', path: '/research?mode=self', flags: {} },
      { iconClass: 'icon fi_grid', title: 'Все объекты', path: '/research?mode=all', flags: { openOnlyFor: 'IS' } },
    ],
    flags: { openOnlyFor: 'NE' },
  },
  {
    title: 'Сделки и предложения',
    description: 'Работа с базой данных сделок и предложений',
    iconClass: 'icon analogs',
    path: '/analog',
    searchParams: '?mode=all',
    additionalItems: [
      { iconClass: 'icon fi_rotate-ccw', title: 'Ваши черновики', path: '/analog?mode=self', flags: {} },
      { iconClass: 'icon fi_grid', title: 'Все предложения', path: '/analog?mode=all', flags: { openOnlyFor: 'IS' } },
    ],
    flags: { openOnlyFor: 'OA' },
  },
  {
    title: 'Каталоги',
    description: 'Работа с пользовательскими каталогами',
    iconClass: 'icon geo',
    path: '/catalog',
    additionalItems: [{ iconClass: 'icon fi_rotate-ccw', title: 'Ваши каталоги', path: '/catalog', flags: {} }],
    flags: { openOnlyFor: 'CAT' },
  },
  {
    title: 'Объекты недвижимости',
    description: 'Работа с базой данных объектов недвижимости',
    iconClass: 'icon geo',
    path: '/real_estate',
    searchParams: '?mode=all',
    additionalItems: [
      { iconClass: 'icon fi_rotate-ccw', title: 'Ваши объекты', path: '/real_estate?mode=self', flags: {} },
      { iconClass: 'icon fi_grid', title: 'Все объекты', path: '/real_estate?mode=all', flags: { openOnlyFor: 'IS' } },
    ],
    flags: { openOnlyFor: 'RE' },
  },
  {
    title: 'Сравнение объектов недвижимости',
    description: 'Сравнение объектов недвижимости по ценообразующим факторам',
    iconClass: 'icon geo',
    path: '/compare',
    additionalItems: [{ iconClass: 'icon fi_rotate-ccw', title: 'Ваши сравнения', path: '/compare', flags: {} }],
    flags: { openOnlyFor: 'COM' },
  },
  {
    title: 'Работа с картой',
    description: 'Комплексный поиск по гео-аттрибутам',
    iconClass: 'icon geo',
    path: '/map',
    additionalItems: [{ iconClass: 'icon fi_map-pin', title: 'Перейти к карте', path: '/map', flags: {} }],
    flags: { openOnlyFor: 'MAP' },
  },
  {
    title: 'Справочники',
    description: 'Нормативно-справочная информация',
    iconClass: 'icon fi_sliders',
    path: '/references',
    additionalItems: [
      {
        iconClass: 'icon fi_sliders icon-medium',
        title: 'Таблицы коэффициентов',
        path: '/references',
        flags: { openOnlyFor: 'IS' },
      },
    ],
    flags: { openOnlyFor: 'REF' },
  },
]

export const permsMatchedSources = [
  {
    perms: ['OO', 'IS', 'ADMIN'],
    matchedSource: 'evaluation',
  },
  {
    perms: ['OA', 'IS', 'ADMIN'],
    matchedSource: 'analog',
  },
  {
    perms: ['NE', 'IS', 'ADMIN'],
    matchedSource: 'research',
  },
  {
    perms: ['RE', 'IS', 'ADMIN'],
    matchedSource: 'real_estate',
  },
  {
    perms: ['CAT', 'IS', 'ADMIN'],
    matchedSource: 'catalog',
  },
  {
    perms: ['COM', 'IS', 'ADMIN'],
    matchedSource: 'compare',
  },
  {
    perms: ['MAP', 'IS', 'ADMIN'],
    matchedSource: 'map',
  },
  {
    perms: ['REF', 'IS', 'ADMIN'],
    matchedSource: 'references',
  },
]
