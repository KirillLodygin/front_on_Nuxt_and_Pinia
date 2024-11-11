const tableColumns = [
  {
    title: '#',
    field: 'index',
    key: 'indexKey',
    label: 'Номер',
    isSwitchOff: true,
    sortDirection: 'none',
    columnIndex: true,
  },
  { title: 'Тип', field: 'type', key: 'typeKey', label: 'Тип', isSwitchOff: false, sortDirection: 'none' },
  { title: 'Объект', field: 'address', key: 'addressKey', label: 'Адрес', isSwitchOff: true, sortDirection: 'none' },
  { title: 'Дата', field: 'updated', key: 'updatedKey', label: 'Обновлено', isSwitchOff: false, sortDirection: 'none' },
]

const allOptions = {
  object_type: {
    label: 'Тип объекта',
    type: 'choice',
    choices: [
      { value: 'Q', display_name: 'Помещение' },
      { value: 'B', display_name: 'Здание' },
      { value: 'L', display_name: 'Земельный участок' },
    ],
  },
}

import { useNuxtApp } from 'nuxt/app'
import { api_unversal_realty } from '~/app_constants/api'
export default defineStore('userProfile', {
  state: () => ({
    tableColumns: <any>tableColumns,
    items: <any>[],
    loading: <boolean>false,
    allOptions: <any>allOptions,
  }),

  actions: {
    resetState() {
      this.$reset()
    },
    setObjects(value: any) {
      this.items = value
      console.log('item:', value)
    },
    setOptionValue(option: any, value: any) {
      const objectTypeValue = this.allOptions[option].choices.filter((item: any) => item.value === value)[0]
      return objectTypeValue ? objectTypeValue.display_name : null
    },
    formatDate(date: Date) {
      const value = new Date(date)
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
      return value.toLocaleDateString('ru-RU', options)
    },
    async getObjects() {
      const { $auth }: any = useNuxtApp()
      this.loading = true
      const { _data } = await $http.get(`${api_unversal_realty}?modified_by_id=${$auth.user.id}&limit=1000`)
      const actions = computed(() => {
        return _data.results.map((analog: Record<string, any>) => {
          return {
            id: analog.id,
            address: analog.address_raw,
            updated: this.formatDate(analog.ads_updated_internal?.split('T')[0]),
            type: this.setOptionValue('object_type', analog.object_type),
          }
        })
      })
      this.loading = false
      this.setObjects(actions)
    },
  },
})
