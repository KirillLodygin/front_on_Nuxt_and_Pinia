const tableColumns = [
  { title: '#', field: 'id', isSwitchOff: true, sortDirection: 'asc' },
  { title: 'Событие', field: 'eventName', sortDirection: 'asc' },
  { title: 'Дата', field: 'date', sortDirection: 'asc' },
  { title: 'Цена аренды, р.', field: 'rentalPrice', sortDirection: 'asc' },
  { title: 'Цена продажи, р.', field: 'sellingPrice', sortDirection: 'asc' },
  // { title: 'Изменение цены', field: 'venue', sortDirection: 'asc' }
]

export default defineStore('historyEstimation', {
  state: () => ({
    tableColumns: <any>tableColumns,
    items: <any>[],
    choices: <any>{},
    eventNameIconMap: <any>{
      'Итоговый расчёт': 'fi_scales-square',
      'Загружено объявление': 'fi_scales-square',
    },
  }),

  actions: {
    resetState() {
      this.$reset()
    },
    setObjects(value: any) {
      this.items = value
      console.log('item:', value)
    },
    setChoices(value: any) {
      this.choices = value
      console.log('choices', value)
    },
    getChoiceValue(value: any, choiceName: string) {
      return this.choices[choiceName][value] || value
    },
    processItems() {
      this.items = this.items.map((item: any) => {
        const newEventName = this.getChoiceValue(item.eventName, 'EventNameChoices')
        const newAdsType = this.getChoiceValue(item.ads_type, 'AdsTypeChoices')
        const date = new Date(item.date)
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
        item.eventName = `${newEventName}`
        item.ads_type = newAdsType
        item.date = date.toLocaleDateString('ru-RU', options)
        if (item.ads_type === 'Аренда') {
          item.rentalPrice = item.sellingPrice
          item.sellingPrice = null
        }
        const eventNameKey = newEventName
          ? Object.keys(this.eventNameIconMap).find((key) => newEventName.includes(key))
          : undefined
        item.eventNameIcon = eventNameKey ? this.eventNameIconMap[eventNameKey] : undefined
        return item
      })
    },
    async getObjects(id: any, type: any) {
      try {
        const actions = await $http
          .get(`/api/v1/osm_obj/history/${id}/${type}/?sort=-date&group=date`)
          .then((res: Record<string, any>) => res._data)
        this.setObjects(actions)
        this.processItems()
      } catch (error) {
        console.error('Error fetching objects:', error)
        this.setObjects([])
      }
    },
    async getChoices() {
      const choices = await $http.get(`/api/v1/osm_obj/choices/`).then((res: Record<string, any>) => res._data)
      this.setChoices(choices)
    },
  },
})
