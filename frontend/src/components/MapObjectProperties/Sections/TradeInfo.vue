<template>
  <div class="h-100 overflow-y-scroll">
    <div v-for="(obj, index) in props.tradeInfo" :key="`${obj}_${index}}`" class="loop-panel mb-3 mx-1">
      <div class="card-container">
        <div class="row">
          <div class="col-12 trade-header d-flex justify-content-between align-items-center">
            <div class="card-title">Торги №{{ index + 1 }}</div>
            <button v-if="+index !== 0" class="btn btn-outline-secondary btn-sm-rounded" @click="deleteTrade(+index)">
              <i class="icon fi_trash" />
            </button>
          </div>
          <div v-for="key in objectsKeys" :key="`${key}_${index}}`" class="col-6 mb-3">
            <TradeInfoInput
              v-if="props.mutableOptions[key]"
              :label="props.mutableOptions[key].objectData.label"
              :value="obj[key]"
              :index="index"
              :select-options="
                props.mutableOptions[key].objectData.choices.length
                  ? props.mutableOptions[key].objectData.choices
                  : props.mutableOptions[key].choices
              "
              :field="key"
              :info="props.mutableOptions[key].flags.info"
              @updateTradeInfo="updateTradeInfo"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="TradeInfo" lang="ts">
import _cloneDeep from 'lodash/cloneDeep'
import { onMounted } from 'vue'
import TradeInfoInput from '../Fields/TradeInfoInput.vue'

const props = defineProps({
  tradeInfo: { type: Object, required: true },
  adsType: { type: String, required: true, default: '' },
  dateTrade: { type: String, required: true, default: '' },
  priceStart: { type: Number, required: true },
  priceStartPerM: { type: Number, required: true },
  priceSale: { type: Number, required: true },
  priceSalePerM: { type: Number, required: true },
  mutableOptions: { type: Object, required: true },
  objectArea: { type: [Number, String], required: false, default: 0 },
})
const emit = defineEmits(['updateMutableData'])
let tradeInfoData: Record<string, any> = []
const objectsKeys = [
  'date_trade',
  'is_trade_ending',
  'price_start',
  'price_start_per_m',
  'price_sale',
  'price_sale_per_m',
]

const tradeInfoInit = {
  date_trade: '',
  is_trade_ending: null,
  price_start: '0',
  price_start_per_m: '0',
  price_sale: '0',
  price_sale_per_m: '0',
}

onMounted(() => {
  if (!props.tradeInfo) {
    tradeInfoData = [_cloneDeep(tradeInfoInit)]
    emit('updateMutableData', 'trade_info', tradeInfoData)
  } else {
    tradeInfoData = props.tradeInfo
    // emit('updateMutableData', 'trade_info', tradeInfoData)
  }
})

const adsTypeOptions = computed(() => {
  return props.mutableOptions.ads_type?.choices.map((obj: any) => {
    return { value: obj.value, text: obj.display_name }
  })
})

const computedAdsTypeValue = computed({
  get() {
    return props.adsType
  },
  set(value) {
    emit('updateMutableData', 'ads_type', value)
  },
})

const updateTradeInfo = (index: number, field: string, value: any) => {
  if (['price_start', 'price_sale'].includes(field)) {
    var valueIsNumber = false
    if (value) {
      valueIsNumber = typeof value === 'number' ? true : /^\d+(\.\d+)?$/.test(value.replace(',', '.'))
    }
    tradeInfoData[index][field] = valueIsNumber ? (+value).toFixed(2) : 0
    // tradeInfoData[index][field] = value
    tradeInfoData[index][`${field}_per_m`] = (value / +props.objectArea).toFixed(2)
  } else if (field === 'date_trade') {
    tradeInfoData[index][field] = !value ? null : value
  } else {
    tradeInfoData[index][field] = value
  }
  if (['is_trade_ending'].includes(field)) {
    tradeInfoData = props.tradeInfo
    if (value === false) {
      tradeInfoData.push(_cloneDeep(tradeInfoInit))
    } else {
      if (index + 1 < tradeInfoData.length) {
        tradeInfoData.splice(index + 1, tradeInfoData.length - index)
      }
    }
    emit('updateMutableData', 'trade_info', tradeInfoData)
  }
  emit('updateMutableData', 'trade_info', tradeInfoData)
  emit('updateMutableData', 'date_trade', tradeInfoData[tradeInfoData.length - 1].date_trade)
  emit('updateMutableData', 'price_start', tradeInfoData[0].price_start)
  emit('updateMutableData', 'price_start_per_m', tradeInfoData[0].price_start_per_m)
  emit('updateMutableData', 'price_sale', tradeInfoData[tradeInfoData.length - 1].price_sale)
  emit('updateMutableData', 'price_sale_per_m', tradeInfoData[tradeInfoData.length - 1].price_sale_per_m)
}

const deleteTrade = (index: number) => {
  tradeInfoData = props.tradeInfo
  tradeInfoData.splice(index, 1)
  tradeInfoData[index - 1].is_trade_ending = null
  emit('updateMutableData', 'trade_info', tradeInfoData)
}
</script>
