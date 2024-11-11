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
        { value: 'address_raw', display_name: 'Адрес', disabled: true },
        { value: 'comparison', display_name: 'Сравнения' },
        { value: 'object_type', display_name: 'Тип объекта' },
        { value: 'name', display_name: 'Название' },
        { value: 'object_type_calc', display_name: 'Статус' },
        { value: 'func_purpose', display_name: 'Функциональное назначение' },
        { value: 'modified_date', display_name: 'Изменён' },
      ],
      type: 'checkbox',
      isCube: false,
    },
    sortField: {
      label: 'Сортировка по столбцу',
      required: true,
      options: [
        { value: 'address_raw', display_name: 'Адрес' },
        { value: 'object_type', display_name: 'Тип объекта' },
        { value: 'title', display_name: 'Название' },
        { value: 'status', display_name: 'Статус' },
        { value: 'func_purpose', display_name: 'Функциональное назначение' },
        { value: 'ads_updated', display_name: 'Изменён' },
        { value: 'name', display_name: 'Имя' },
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
