<template>
  <div class="price-and-area">
    <div class="card-title mt-2 mb-3">Цена</div>
    <div class="row mb-4">
      <div class="label-wrapper col-6 order-1">
        <p v-if="exchangeType === 'M'" class="label-text d-flex justify-content-start" style="margin: 0">
          Цена сделки/предложения
          <i class="icon form_required-star map-object-properties_body_input_required-star" />
        </p>
        <p v-else class="label-text d-flex justify-content-start" style="margin: 0">
          Конечная цена <i class="icon form_required-star map-object-properties_body_input_required-star" />
        </p>
      </div>
      <div class="price-and-area-input-wrapper price-and-area-input-wrapper_price col-6 order-3">
        <BFormInput
          v-if="indicatorChangeCurrency"
          :id="'currency_input'"
          v-model.number="modelNumberCurrency"
          :disabled="mutableData.func_purpose.name === 'Прочее' || disabledComputed"
          :formatter="decimalFormatter"
          :no-wheel="true"
          :required="true"
          :state="currencyValue !== null && currencyValue !== 0"
          :type="'number'"
          class="map-object-properties_body_input map-object-properties_body_input__price form-control form-control-lg"
          @blur="indicatorChangeCurrency = false"
        />
        <BFormInput
          v-else
          :id="'currency_input'"
          v-model.number="modelNumberCurrency"
          :disabled="mutableData.func_purpose.name === 'Прочее' || disabledComputed"
          :formatter="decimalFormatter"
          :no-wheel="true"
          :required="true"
          :state="currencyValue !== null && currencyValue !== 0"
          :type="'text'"
          class="noscroll map-object-properties_body_input map-object-properties_body_input__price form-control form-control-lg"
          @focus="
            () => {
              changeInput()
            }
          "
        />

        <CustomSelect
          :default="currencyCurrentOption"
          :disabled="mutableData.func_purpose.name === 'Прочее'"
          :is-cube="false"
          :options="currencyOptions"
          :price="true"
          :required="true"
          :field="'price_sale_source_currency'"
          class="button-wrapper"
          :disabled-modifier="$objectStore.readOnly"
          @input="
            ($event) => {
              currencyCurrentOption = $event
              updatePrice()
            }
          "
        />
      </div>
      <MapObjectPropertiesInput
        :data="mutableData.price_sale"
        :disabled="true"
        :field="'price_sale'"
        :mutable-data="mutableData"
        :object-data="mutableOptions.price_sale.objectData"
        :required="false"
        :index="2"
      ></MapObjectPropertiesInput>
    </div>
    <div class="row mb-4">
      <div class="label-wrapper d-flex justify-content-start col-6 order-1">
        Тип цены <i class="icon form_required-star map-object-properties_body_input_required-star" />
      </div>
      <div class="price-and-area-input-wrapper col-6 order-3">
        <CustomSelect
          :default="priceType"
          :disabled="mutableData.func_purpose.name === 'Прочее'"
          :is-cube="false"
          :options="priceTypeOptions"
          :required="true"
          :field="'price_sale_source_type'"
          class="price-type w-100"
          :disabled-modifier="$objectStore.readOnly"
          @input="
            ($event) => {
              priceType = $event
              updatePrice()
            }
          "
        />
      </div>
      <MapObjectPropertiesInput
        :data="mutableData.price_sale_per_m"
        :disabled="true"
        :field="'price_sale_per_m'"
        :mutable-data="mutableData"
        :object-data="mutableOptions.price_sale_per_m.objectData"
        :required="false"
        :index="2"
      ></MapObjectPropertiesInput>
    </div>
    <div v-if="adsType !== 'S'" class="row mb-4">
      <div class="col-6">
        <div class="label-wrapper d-flex justify-content-start">
          Период
          <i v-if="adsType === 'R'" class="icon form_required-star map-object-properties_body_input_required-star" />
        </div>
        <div class="price-and-area-input-wrapper w-100">
          <CustomSelect
            :default="periodData"
            :disabled="adsType === 'S' || mutableData.func_purpose.name === 'Прочее'"
            :is-cube="false"
            :is-for-rent="true"
            :options="periodOptions"
            :required="adsType === 'R'"
            :field="'price_rent_period'"
            class="w-100"
            :disabled-modifier="$objectStore.readOnly"
            @input="
              ($event) => {
                period = $event
                updatePrice()
              }
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CustomSelect from '~/components/UI-KIT/Selects/BaseCustomSelect.vue'
import MapObjectPropertiesInput from '~/components/MapObjectProperties/Fields/MapObjectPropertiesInput.vue'

interface Props {
  areaData: number | string
  currencyData: number | string
  initialCurrency: string
  date: string
  priceTypeOptionsData: any[]
  priceTypeData: string
  periodData: number | string
  periodOptions: any[]
  adsType: string
  exchangeType: string
  mutableData: { [key: string]: any }
  mutableOptions: { [key: string]: any }
}

const {
  areaData,
  currencyData,
  initialCurrency,
  date,
  priceTypeOptionsData,
  priceTypeData,
  periodData,
  periodOptions,
  adsType,
  exchangeType,
  mutableData,
  mutableOptions,
} = defineProps<Props>()
const emit = defineEmits(['updateMutableData'])
const { $objectStore } = useNuxtApp()
const currencyOptions: Ref<any[]> = ref(
  exchangeType === 'M'
    ? [
        { value: 1, display_name: '₽', currency: 'RUB' },
        { value: 75, display_name: '$', currency: 'USD' },
        { value: 80, display_name: '€', currency: 'EUR' },
      ]
    : [{ value: 1, display_name: '₽', currency: 'RUB' }],
)
const currencyCurrentOption: Ref<any> = ref(1)
const areaOptions: Ref<any[]> = ref([
  { value: 1, display_name: 'м²' },
  { value: 100, display_name: 'сот' },
  { value: 10000, display_name: 'га' },
])
const areaCurrentOption: Ref<any> = ref(1)
const areaValue: Ref<any> = ref(+areaData)
const currencyValue: Ref<any> = ref(+currencyData)
const indicatorChangeCurrency: Ref<boolean> = ref(false)
const priceType: Ref<any> = ref(priceTypeData)
const priceTypeOptions: Ref<any[]> = ref(priceTypeOptionsData)
const period: Ref<any> = ref(periodData)

const modelNumberCurrency = computed({
  get() {
    return indicatorChangeCurrency.value || currencyValue.value === null
      ? currencyValue.value
      : (+currencyValue.value)
          .toLocaleString(undefined, { maximumFractionDigits: 20 })
          .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/, ' ')
  },
  set(value) {
    if (value === '') currencyValue.value = null
    else currencyValue.value = +value
    updatePrice()
  },
})

const objectAreaUpdated = computed(() => {
  return $objectStore.keysByObj.areaData
})
watch(
  () => mutableData.object_area,
  (newVal) => {
    console.log('objectAreaUpdated.value', objectAreaUpdated.value, areaData)
    areaValue.value = newVal

    updatePrice()
  },
)

const dateUpdated = computed(() => {
  return $objectStore.keysByObj.date
})

onMounted(() => {
  updatePrice()
})
onBeforeMount(async () => {
  getInitialCurrency()
})

function decimalFormatter(value: string) {
  return value.replace(/[^0-9.,]+/g, '')
}

async function changeInput() {
  // Show the input component
  indicatorChangeCurrency.value = true

  currencyValue.value = currencyValue.value !== null ? currencyValue.value : null
  // Focus the component, but we have to wait
  // so that it will be showing first.
  await nextTick()

  document.getElementById('currency_input')!.focus()
}

function updatePeriod(value: any) {
  emit('updateMutableData', 'price_rent_period', value)
}

function getInitialCurrency() {
  currencyOptions.value.forEach((item: any) => {
    if (item.currency === initialCurrency) {
      currencyCurrentOption.value = item.value
    }
  })
}

function getCurrency() {
  let currency
  currencyOptions.value.forEach((item) => {
    if (item.value === currencyCurrentOption.value) {
      currency = item.currency
    }
  })
  return currency
}

async function getValutes(date: any) {
  if (!date) return
  const eur = await $http
    .get(`api/v1/references/valute?date=${date}&char_code=eur`)
    .then((res: Record<string, any>) => res._data)
  const usd = await $http
    .get(`api/v1/references/valute?date=${date}&char_code=usd`)
    .then((res: Record<string, any>) => res._data)
  currencyOptions.value[1].value = +usd.value
  currencyOptions.value[2].value = +eur.value
}

function updatePrice() {
  emit('updateMutableData', 'price_sale_currency', 'RUB')
  emit('updateMutableData', 'price_sale_per_m_currency', 'RUB')
  emit('updateMutableData', 'price_sale_source_currency', getCurrency())

  if (priceType.value && (period.value || adsType === 'S')) {
    emit(
      'updateMutableData',
      'price_sale',
      priceType.value === 'A'
        ? (currencyValue.value * currencyCurrentOption.value).toFixed(2)
        : (currencyValue.value * currencyCurrentOption.value * areaValue.value * areaCurrentOption.value).toFixed(2),
    )
    console.log('updatePrice()', currencyValue.value)
    emit('updateMutableData', 'price_sale_source', currencyValue.value)
    emit('updateMutableData', 'price_sale_source_type', priceType.value)
    emit('updateMutableData', 'price_rent_period', period.value)
    const newValue =
      priceType.value === 'A'
        ? +(
            (currencyValue.value * currencyCurrentOption.value) /
            (areaValue.value * areaCurrentOption.value) /
            (period.value === 'Y' ? 12 : 1)
          ).toFixed(2)
        : +((currencyValue.value * currencyCurrentOption.value) / (period.value === 'Y' ? 12 : 1)).toFixed(2)
    console.log(newValue, currencyValue.value, currencyCurrentOption.value, areaValue.value, areaCurrentOption.value)
    emit('updateMutableData', 'price_sale_per_m', isNaN(newValue) ? null : newValue)
  }
}

const disabledComputed = computed(() => $objectStore.readOnly)
</script>
