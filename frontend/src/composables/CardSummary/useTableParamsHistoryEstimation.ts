export function useTableParamsHistoryEstimation() {
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
        { value: 'id', display_name: '#' },
        { value: 'eventName', display_name: 'Событие' },
        { value: 'date', display_name: 'Дата' },
        { value: 'sellingPrice', display_name: 'Цена продажи' },
        // { value: 'rentalPrice', display_name: 'Цена аренды' },
        // { value: 'priceChange', display_name: 'Изменение  цены' },
      ],
      type: 'checkbox',
      isCube: false,
    },
    groupingField: {
      label: 'Группировка',
      required: false,
      options: [
        { value: 'no', display_name: 'Нет' },
        { value: 'date', display_name: 'Дата' },
        { value: 'typeOffers', display_name: 'Тип предложения' },
      ],
      type: 'choice',
      isCube: false,
    },
    sortField: {
      label: 'Сортировка по столбцу',
      required: false,
      options: [
        { value: 'no', display_name: 'Нет' },
        { value: 'eventName', display_name: 'Событие' },
        { value: 'date', display_name: 'Дата' },
        { value: 'sellingPrice', display_name: 'Цена продажи' },
        // { value: 'rentalPrice', display_name: 'Цена аренды' },
        // { value: 'priceChange', display_name: 'Изменение  цены' },
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
