<template>
  <BModal
    v-model="value"
    :cancel-title="'Отмена'"
    :ok-title="'Готово'"
    :body-class="'px-5 overflow-y-hidden h-100'"
    :scrollable="true"
    :dialog-class="'employee-report-modal-dialog'"
  >
    <template #title>
      <div class="employee-report-title"><i class="icon fi_file icon-xl me-1" />ОТЧЁТ О ЗАГРУЖЕННОСТИ СОТРУДНИКОВ</div>
    </template>
    <div class="d-flex flex-column h-100">
      <div class="d-flex flex-shrink-0 row mb-2">
        <MapObjectPropertiesInputLabel
          :object-data="{ label: 'Дата с' }"
          :required-computed="true"
          :class="`col-${'6'} order-${1}`"
        />
        <MapObjectPropertiesInputLabel
          :object-data="{ label: 'Дата по' }"
          :required-computed="true"
          :class="`col-${'6'} order-${2}`"
        />
        <div :class="`col-${'6'} order-${3}`">
          <DatePickerInput
            v-model="data.start_date"
            :placeholder="'дд.мм.гггг'"
            :id="'employee-start-date'"
            :max-date="data.end_date"
          />
        </div>
        <div :class="`col-${'6'} order-${4}`">
          <DatePickerInput
            v-model="data.end_date"
            :placeholder="'дд.мм.гггг'"
            :id="'employee-end-date'"
            :min-date="data.start_date"
          />
        </div>
      </div>
      <div class="employee-report-checkbox">
        <InputByType
          v-model="data.ids_list"
          :is-cube="false"
          :label="'Пользователи группы'"
          :options="computedOptions"
          :required="true"
          :type="'checkbox'"
          :checkbox-container-class="'overflow-y-scroll h-100 justify-content-start'"
          class="employee-report-checkbox"
        />
      </div>
    </div>
    <template #footer="{ ok, cancel }">
      <div>
        <button :class="'btn btn-md btn-outline-secondary'" type="button" @click="cancel()">
          {{ 'Отмена' }}
        </button>
        <button
          :class="'btn btn-md btn-primary ms-2'"
          type="button"
          :disabled="!isRequiredFieldsReady || isReportFetching"
          @click="
            async () => {
              await fetchReport()
            }
          "
        >
          {{ 'Готово' }}
          <BSpinner v-if="isReportFetching" :small="true" />
        </button>
      </div>
    </template>
  </BModal>
</template>

<script setup lang="ts">
import DatePickerInput from '~/components/UI-KIT/Inputs/DatePickerInput.vue'
import InputByType from '../UI-KIT/InputByType.vue'
import MapObjectPropertiesInputLabel from '~/components/MapObjectProperties/Fields/MapObjectPropertiesInputLabel.vue'

import { api_worker_stat } from '~/app_constants/api'
interface Props {
  modelValue: boolean
}
const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])
const { $userStore } = useNuxtApp()
const value = computed({
  get: () => {
    return props.modelValue
  },
  set: (value) => {
    emit('update:modelValue', value)
  },
})
const data: {
  start_date: string | null
  end_date: string | null
  ids_list: string[]
} = reactive({
  start_date: null,
  end_date: null,
  ids_list: [],
})
const users: string[] = reactive([])
const isReportFetching = ref(false)

onBeforeMount(async () => {
  const usersFromStore = await $userStore.getAllUsers()
  users.push(
    ...usersFromStore
      .filter((item: any) => item.first_name !== 'Test')
      .sort((a: any, b: any) => a.last_name.localeCompare(b.last_name)),
  )
  // data.ids_list = users.map((item: any) => {
  //   return item.id.toString()
  // })
})

const computedOptions = computed(() => {
  return users.map((item: any) => {
    return {
      value: item.id.toString(),
      display_name: `${item.last_name} ${item.first_name}${item.org_short_name ? ` (${item.org_short_name})` : ''}`,
    }
  })
})

async function fetchReport() {
  isReportFetching.value = true
  const docName = `Статистика сотрудников ${data.start_date}-${data.end_date}.xlsx`
  const respType = 'application/xlsx'
  const response = await $http.get(api_worker_stat, {
    params: {
      start_date: normalizeDate(data.start_date!),
      end_date: normalizeDate(data.end_date!),
      ids_list: data.ids_list.join(','),
    },
    responseType: 'blob',
  })
  const blob = new Blob([response._data], { type: respType })

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', docName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  isReportFetching.value = false
}

function normalizeDate(date: string) {
  const [day, month, year] = date.split('.')
  return `${year}-${month}-${day}`
}

const isRequiredFieldsReady = computed(() => {
  if (!data.start_date) return false
  if (!data.end_date) return false
  if (!data.ids_list.length) return false
  return true
})
</script>

<style scoped></style>
