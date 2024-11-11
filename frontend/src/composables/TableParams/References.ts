export function useTableParams() {
  const tableParams = {
    limit: {
      label: 'Число записей в таблице',
      required: true,
      options: [
        { value: 15, display_name: '15' },
        { value: 30, display_name: '30' },
        { value: 50, display_name: '50' },
        { value: 100, display_name: '100' },
      ],
      type: 'choice',
      isCube: true,
    },
    displayedColumns: {
      label: 'Отображение столбцов',
      required: true,
      options: [
        { value: 'name_unique', display_name: 'Название' },
        { value: 'type', display_name: 'Тип недвижимости' },
        { value: 'source', display_name: 'Источник информации' },
        { value: 'type_calc', display_name: 'Тип сделки' },
        { value: 'param_name', display_name: 'Ценообразующий параметр' },
      ],
      type: 'checkbox',
      isCube: false,
    },
    sortField: {
      label: 'Сортировка по столбцу',
      required: true,
      options: [
        { value: 'name_unique', display_name: 'Название таблицы' },
        { value: 'type', display_name: 'Тип недвижимости' },
        { value: 'source', display_name: 'Источник информации' },
        { value: 'type_calc', display_name: 'Тип сделки' },
        { value: 'param_name', display_name: 'Ценообразующий параметр' },
      ],
      type: 'choice',
      isCube: false,
    },
    sortDirection: {
      label: 'Направление сортировки',
      required: true,
      options: [
        { value: 'asc', display_name: 'По возрастанию' },
        { value: 'desc', display_name: 'По убыванию' },
      ],
      type: 'choice',
      isCube: true,
    },
  }

  return { tableParams }
}
