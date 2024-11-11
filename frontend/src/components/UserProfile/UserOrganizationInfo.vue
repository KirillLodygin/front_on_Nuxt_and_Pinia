<template>
  <div class="h-100 d-flex flex-column">
    <h3 class="card-header mb-3">Информация об организации</h3>
    <div class="overflow-y-scroll pe-3">
      <template v-if="Object.keys(filteredOrganization).length">
        <!-- <div class="info-item" v-for="(value, key) in filteredOrganization" :key="key">
          <div>
            <span class="label">{{ getLabel(key) }}:</span>
            <span class="value">{{ value ? value : 'Данные отсутствуют' }}</span>
          </div>
        </div> -->

        <div v-for="pair in scenario" :key="pair[0] + pair[1]" class="row card-panel-row mb-3">
          <template
            v-for="(varietyInput, index) in pair"
            :key="varietyInput"
            :class="pair.length === 2 ? 'col-6 mb-3' : 'col-12 mb-3'"
          >
            <div
              class="map-object-properties_body_input_label-wrapper d-flex justify-content-start align-self-end"
              :class="`col-${pair.length === 1 ? '12' : '6'} order-${index}`"
            >
              <span class="map-object-properties_body_input_label-text">{{ getLabel(varietyInput) }}</span>
            </div>
            <div class="input-and-icon" :class="`col-${pair.length === 1 ? '12' : '6'} order-${index + 2}`">
              <BFormInput
                v-model="filteredOrganization[varietyInput]"
                :disabled="true"
                autocomplete="none"
                class="map-object-properties_body_input form-control form-control-lg"
                type="text"
              ></BFormInput>
            </div>
          </template>
        </div>
      </template>
      <template v-else>
        <div class="empty-state mb-3">Данные об организации отсутствуют</div>
      </template>
    </div>
    <template v-if="userPermissions.includes('ER')"
      ><h3 class="card-header card-header__bordered mb-3 pt-2">Дополнительно</h3>
      <div>
        <button class="btn bth-tool p-3" @click="isShowEmployeeReport = true">
          <i class="icon fi_file me-1" />Отчёт о загруженности сотрудников
        </button>
        <EmployeeReport v-model="isShowEmployeeReport" /></div
    ></template>
  </div>
</template>

<script setup lang="ts">
import EmployeeReport from './EmployeeReport.vue'
interface OrganizationType {
  name: string
  short_name: string
  inn: string
  kpp: string
  ogrn: string
  actual_address: string
  legal_address: string
  contact_person: string
  phone: string
}

const { $auth, $userStore } = useNuxtApp()
const userPermissions: string[] = useUserPermissions($auth.user?.permissions)
//@ts-ignore
const profile = $auth.user?.profile as UserProfileType
const organization = profile?.organization || ({} as OrganizationType)

const getLabel = (key: any) => {
  const labels: { [key: string]: string } = {
    name: 'Полное наименование',
    short_name: 'Краткое наименование',
    inn: 'ИНН',
    kpp: 'КПП',
    ogrn: 'ОГРН',
    actual_address: 'Фактический адрес',
    legal_address: 'Юридический адрес',
    contact_person: 'Контактное лицо',
    phone: 'Телефон',
  }
  return labels[key] || key
}

const scenario = [
  ['name'],
  ['short_name', 'inn'],
  ['kpp', 'ogrn'],
  ['actual_address', 'legal_address'],
  ['phone', 'contact_person'],
]

const isShowEmployeeReport = ref(false)

// Создание нового объекта без первого элемента
const filteredOrganization: Record<string, any> = Object.fromEntries(Object.entries(organization).slice(1))
</script>

<style scoped>
.organization-info {
  margin: 20px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-family: Manrope;
  font-size: 20px;
  font-weight: 500;
  line-height: 27px;
  letter-spacing: 0.20000000298023224px;
  text-align: left;
}

.card-body {
  padding: 0;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.label {
  font-weight: bold;
  color: #333;
  margin-right: 10px;
}

.value {
  color: #555;
}

.empty-state {
  text-align: center;
  color: #999;
  font-style: italic;
}

.card-header__bordered {
  border-top: 1px solid var(--dark-gray);
}
</style>
