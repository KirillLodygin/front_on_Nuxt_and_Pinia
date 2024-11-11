<template>
  <BModal
    v-model="value"
    :class="{ 'd-block': value }"
    centered
    content-class=""
    dialog-class=""
    modal-class="table-params_body"
    :ok-only="true"
    ok-title="Применить"
    title="Параметры таблицы"
    @ok="
      () => {
        emit('acceptParameters', dataValue)
      }
    "
  >
    <InputByType
      v-for="param in displayedInputs"
      v-model="dataValue[param]"
      :is-cube="tableParams[param].isCube"
      :label="tableParams[param].label"
      :name="param"
      :options="computedOptions(param)"
      :required="tableParams[param].required"
      :type="tableParams[param].type"
    />
  </BModal>
</template>

<script lang="ts" setup>
import InputByType from '~/components/UI-KIT/InputByType.vue'
import type { PropType } from 'vue'
import { cloneDeep } from 'lodash'

interface TableParamsDataInterface {
  limit: number
  displayedColumns: string[]
  sortField: string | null
  sortDirection: string | null
}

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  tableParams: { type: Object as PropType<any>, required: true },
  data: { type: Object as PropType<TableParamsDataInterface>, required: true },
})

const emit = defineEmits(['update:modelValue', 'acceptParameters'])
const dataValue: any = ref({ ...props.data })
const value = computed({
  get: () => {
    dataValue.value = cloneDeep(props.data) // Обновление при каждом открытии модального окна
    return props.modelValue
  },
  set: (value) => {
    emit('update:modelValue', value)
  },
})

const computedOptions = (param: string) => {
  if (param === 'sortField') {
    return props.tableParams[param].options.filter((item: Record<string, string>) =>
      props.data.displayedColumns.includes(item.value),
    )
  } else {
    return props.tableParams[param].options
  }
}

if (props.tableParams.sortField && !props.tableParams.sortField.required) {
  watch(
    () => dataValue.value.sortField,
    (newVal) => {
      if (newVal) dataValue.value.sortDirection = 'asc'
      else dataValue.value.sortDirection = 'none'
    },
  )
}

const displayedInputs = computed(() => {
  const sortFieldCase = props.tableParams.sortField.required ? true : dataValue.value.sortField
  const toDisplayFull = props.tableParams.sortField ? sortFieldCase : true
  return toDisplayFull
    ? Object.keys(props.tableParams)
    : Object.keys(props.tableParams).filter((field) => field !== 'sortDirection')
})
</script>
