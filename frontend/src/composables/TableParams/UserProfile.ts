export function useTableParams() {
  const tableParams = {
    limit: {
      label: 'Число записей на странице',
      required: false,
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
      required: false,
      options: [
        { value: 'type', display_name: 'Тип' },
        { value: 'address', display_name: 'Объект', disabled: true },
        { value: 'updated', display_name: 'Дата' },
      ],
      type: 'checkbox',
      isCube: false,
    },
    sortField: {
      label: 'Сортировка по столбцу',
      required: true,
      options: [
        { value: 'type', display_name: 'Тип' },
        { value: 'updated', display_name: 'Дата' },
      ],
      type: 'choice',
      isCube: false,
    },
    sortDirection: {
      label: 'Направление сортировки',
      required: false,
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
