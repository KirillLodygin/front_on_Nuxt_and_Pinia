import { defineStore } from 'pinia'
import { api_address_vermins, api_users } from '~/app_constants/api'

interface AddressVerminsState {
  wordParasites: {
    C: object
    V: string[]
    P: string[]
  }
  isLoadingWordParasites: boolean
  wordParasitesPromise: Promise<Record<string, any>> | null
}

export default defineStore('addressVermins', {
  state: () =>
    <AddressVerminsState>{
      wordParasites: {},
      isLoadingWordParasites: false,
      wordParasitesPromise: null,
    },
  actions: {
    resetState() {
      this.$reset()
    },
    async getWordParasites(): Promise<any> {
      if (Object.keys(this.wordParasites).length) {
        return this.wordParasites
      }
      if (this.isLoadingWordParasites && this.wordParasitesPromise) {
        return this.wordParasitesPromise
      }
      this.isLoadingWordParasites = true
      this.wordParasitesPromise = $http
        .get(api_address_vermins)
        .then((res: Record<string, any>) => {
          this.wordParasites = res._data
          return res._data
        })
        .catch((err: any) => {
          console.error(err)
        })
        .finally(() => {
          this.isLoadingWordParasites = false
          this.wordParasitesPromise = null
        })
      return this.wordParasitesPromise
    },
    analyzeAddress(address: string) {
      if (Object.keys(this.wordParasites).length) {
        const cleaner = this.wordParasites.C // заменяются значением, если встречается ключ
        const vermins = this.wordParasites.V // удаляются блоки, если встречаются эти включения
        const parasites = this.wordParasites.P // удаляются только эти слова
        Object.entries(cleaner).forEach(([key, value]) => {
          address = address.replace(key.replace(/#/g, ' '), value.replace(/#/g, ' '))
        })
        const addressList = address.split(',')
        const filteredWord = addressList.filter(
          (el) => !vermins.some((ignore) => el.includes(ignore.replace(/#/g, ' '))),
        )
        address = filteredWord.join(',')
        for (const par of parasites) {
          address = address.replace(par.replace(/#/g, ' '), '')
        }
        address = address.replace(/,/g, ' ')
      }
      console.log(address)
      return address
    },
  },
})
