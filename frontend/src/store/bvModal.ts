import { defineStore } from 'pinia'
import { useModal, useToast } from 'bootstrap-vue-next'

const modals: Record<string, boolean> = {}
const msgBoxRes: boolean = false
const msgBoxArgs: string = ''
const message: string = ''

export default defineStore('bvModal', {
  state: () => ({
    message: message,
    properties: {},
    msgBoxFunc: () => {},
    msgBoxArgs: msgBoxArgs,
    msgBoxRes: msgBoxRes,
    modals: modals,
    isShowFiltersAdditionalParameters: false,
  }),
  actions: {
    resetState() {
      this.$reset()
    },
    show(id: string) {
      this.modals[id] = true
    },
    hide(id: string) {
      this.modals[id] = false
    },
    async msgBoxConfirm(message: string, data: any, ok = false) {
      this.message = message
      this.properties = {
        okOnly: false,
        okDisabled: false,
        cancelDisabled: false,
        hideFooter: false,
        ...data,
      }
      const bvModal = useModal('msgBoxConfirm')
      const bvModalElem = document.querySelector('#msgBoxConfirm')
      bvModal.show()
      if (bvModalElem) {
        bvModalElem.classList.add('show')
        // bvModalElem.style.display = ''
      }

      let sleep = (ms: any) => new Promise((r) => setTimeout(r, ms))
      let waitFor = async function waitFor(f: any) {
        while (!f()) await sleep(1000)
        return f()
      }
      return await new Promise(async (resolve, reject) => {
        await waitFor(() => {
          return true
        })

        const res = this.msgBoxRes
        this.msgBoxRes = false
        if (bvModalElem) {
          bvModalElem.classList.remove('show')
          // bvModalElem.style.display = 'none'
        }
        resolve(res)
      })
    },
    msgBoxConfirmYes() {
      this.msgBoxRes = true
    },
    msgBoxConfirmNo() {
      this.msgBoxRes = false
    },
    async msgBoxOk(message: string, variant = 'light') {
      const { show } = useToast()
      // @ts-ignore
      show(message, {
        title: 'Сообщение!',
        variant: variant,
        pos: 'top-center',
        value: 3000,
        interval: 300,
      })
      return true
    },
    closeFiltersAdditionalParameters() {
      this.isShowFiltersAdditionalParameters = false
      console.log(
        'closeFiltersAdditionalParameters this.isShowFiltersAdditionalParameters',
        this.isShowFiltersAdditionalParameters,
      )
    },
    showFiltersAdditionalParameters() {
      this.isShowFiltersAdditionalParameters = true
    },
  },
  getters: {
    getShownStateById: (state) => {
      return (id: string) => state.modals[id]
    },
  },
})
