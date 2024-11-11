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
        { value: 'type', display_name: 'Тип' },
        { value: 'name', display_name: 'Название' },
        { value: 'object_type', display_name: 'Тип объекта' },
        // { value: 'ads_type', display_name: 'Тип объявления' },
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
        { value: 'type', display_name: 'Тип' },
        { value: 'name', display_name: 'Название' },
        { value: 'object_type', display_name: 'Тип объекта' },
        // { value: 'ads_type', display_name: 'Тип объявления' },
        { value: 'func_purpose', display_name: 'Функциональное назначение' },
        { value: 'modified_date', display_name: 'Изменён' },
      ],
      type: 'choice',
      isCube: false,
    },
    grouped: {
      label: 'Группировка',
      required: true,
      options: [
        { value: 'on', display_name: 'Вкл.' },
        { value: 'off', display_name: 'Выкл.' },
      ],
      type: 'choice',
      isCube: true,
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
