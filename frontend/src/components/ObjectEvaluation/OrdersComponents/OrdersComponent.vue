<template>
  <FunctionalButtons :data="functionalButtonsData" />
  <OrdersTable
    :active-order="activeOrder"
    :loading="loading"
    :orders="orders"
    @onRowCtx="onRowCtx"
    @openOrder="openOrder"
    @setActiveOrder="setActiveOrder"
  />
  <!--контекстное меню таблицы аналогов-->
  <ks-dropdown ref="rowCtxMenu" :target="'_body'" drop-pos="pointer">
    <div v-for="buttonData in functionalButtonsData">
      <button
        v-if="buttonData.type === 'button' && buttonData.for.includes('ctx')"
        :disabled="buttonData.disabled"
        class="dropdown-item cursor-pointer"
        @click="buttonData.function"
      >
        <i :class="buttonData.iconClass"></i> {{ buttonData.title }}
      </button>
    </div>
  </ks-dropdown>
  <ModalMessage
    v-model="removeOrderModal"
    icon="fi_info"
    title="УДАЛЕНИЕ СОХРАНЕННОГО РАСЧЕТА"
    variant="primary"
    @ok="removeOrder"
  >
    Хотите удалить сохраненный расчет?
  </ModalMessage>
  <ModalMessage
    v-model="duplicateOrderModal"
    icon="fi_info"
    title="СОЗДАНИЕ КОПИИ СОХРАНЕННОГО РАСЧЕТА"
    variant="primary"
    @ok="duplicateOrder"
  >
    Хотите создать копию сохраненного расчета?
  </ModalMessage>
  <ModalMessage
    v-model="setOrderEndStatusModal"
    icon="fi_info"
    title="УСТАНОВКА СТАТУСА 'ИТОГОВЫЙ'"
    variant="primary"
    @ok="makeEnded"
  >
    Хотите установить статус 'итоговый' для сохраненного расчета?
  </ModalMessage>
  <ModalMessage
    v-model="isOpenMakeDealObjectModal"
    v-model:show-again="showAgainMakeDealObjectModal"
    icon="fi_info"
    okTitle="Продолжить"
    size="lg"
    title="СДЕЛКА ИЗ ОЦЕНКИ"
    @ok="createNewObjectFromEvaluation()"
  >
    На основе данной карточки оценки будет создана карточка предложения в режиме сделки. Поля стоимости будут заполнены
    на основе выбранного расчёта. Остальные поля сделки Вы сможете заполнить самостоятельно.
  </ModalMessage>
  <ModalMessage v-model="isAlertInfoOpen" okOnly title="ОШИБКА СОХРАНЕННОГО РАСЧЕТА" variant="danger">
    Это старое сохранение не может быть открыто в новой версии программы!
  </ModalMessage>

  <ModalMessage
    v-model="isShowAttentionWindow"
    okOnly
    title="НОВЫЙ РАСЧЕТ НЕВОЗМОЖЕН"
    variant="danger"
    @ok="closeAttention()"
  >
    Перед оценкой необходимо сохранить изменения в карточке!
  </ModalMessage>

  <BModal
    v-model="renameOrderModal"
    :class="{ 'd-block': renameOrderModal }"
    centered
    size="md"
    title="ПЕРЕИМЕНОВАТЬ СОХРАНЕННЫЙ РАСЧЕТ"
    @close="() => {}"
    @ok="() => saveNewOrderName()"
  >
    <div class="file-rename_label">Название</div>
    <div class="input-group mb-3">
      <input
        v-model="orderName"
        aria-describedby="file-rename"
        aria-label="Название файла"
        class="form-control form-control-lg map-object-properties_body_input"
        type="text"
      />
    </div>
    <template #footer="{ ok, cancel }">
      <div class="d-flex justify-content-end">
        <button
          class="btn btn-md btn-outline-secondary"
          @click="
            () => {
              cancel()
            }
          "
        >
          Отмена
        </button>
        <button class="btn btn-md btn-primary ms-2" @click="() => ok()">Сохранить</button>
      </div>
    </template>
  </BModal>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { navigateTo, useNuxtApp, useRoute } from 'nuxt/app'
import { functional_purpose_analog, orderSourceKeys } from '~/app_constants/calculationsConsts'
import useUserPermissions from '~/composables/useUserPermissions'
import { useAimModalFields } from '~/composables/useAimModalFields'
import { useShortAim } from '~/composables/useShortAim'
import { evaluation } from '~/app_constants/mapObjectConsts'

import FunctionalButtons from '~/components/UI-KIT/Buttons/ButtonsGroup/FunctionalButtons.vue'
import KsDropdown from '~/components/MapComponent/KsDropdown.vue'
import OrdersTable from '~/components/ObjectEvaluation/OrdersComponents/OrdersTable.vue'
import ModalMessage from '~/components/UI-KIT/Alerts/ModalMessage.vue'

const { $calculations, $userStore, $objectStore, $auth, $geoObject } = useNuxtApp()
const route = useRoute()
const props = defineProps({
  showMap: { type: Boolean, default: false },
})
const orders = computed(() => $calculations.orders)
const loading = ref(false)
const activeOrder: Ref<Record<string, any> | null> = ref(null)
const rowCtxMenu: any = ref(null)
const removeOrderModal = ref(false)
const renameOrderModal = ref(false)
const duplicateOrderModal = ref(false)
const setOrderEndStatusModal = ref(false)
const isOpenMakeDealObjectModal = ref(false)
const showAgainMakeDealObjectModal = ref(false)
const isAlertInfoOpen = ref(false)
const orderName = ref('')
const setActiveOrder = (order: any) => {
  activeOrder.value = order
}
// нажатие правой кнопкой мыши на строку
const onRowCtx = (event: Event, order: any) => {
  activeOrder.value = order
  if (rowCtxMenu.value) rowCtxMenu.value.show(event)
}
// наблюдение за активным ордером, чтобы активировать кнопки на панели
watch(
  [
    () => activeOrder.value,
    () => $objectStore.isRequiredFieldsReady,
    () => $calculations.isFormChanged,
    () => $objectStore.readOnly,
  ],
  () => {
    orderName.value = activeOrder.value?.name ? activeOrder.value?.name : ''
    functionalButtonsData.value.forEach((button: any) => {
      if ($objectStore.readOnly) {
        button.disabled = true
        return
      }
      if (button.title === 'Новый расчет') {
        button.disabled =
          !($objectStore.isRequiredFieldsReady && !$calculations.isFormChanged) || $calculations.isFormChanged
      }
      if (button.title === 'Экспорт') {
        button.disabled = !['C', 'E'].includes(activeOrder.value?.evaluation_status)
        button.options.forEach((option: any) => {
          if (activeOrder.value) {
            option.disabled = !['C', 'E'].includes(activeOrder.value?.evaluation_status)
          }
        })
      }
      if (button.for.includes('ctx') && activeOrder.value) {
        if (
          userPermissions.includes('ADMIN') &&
          ['Сделать итоговым', 'Переименовать', 'Удалить'].includes(button.title)
        ) {
          button.disabled = false
        } else if (
          activeOrder.value.evaluation_status === 'P' &&
          ['Открыть', 'Переименовать', 'Удалить'].includes(button.title)
        ) {
          button.disabled = false
        } else if (
          activeOrder.value.evaluation_status === 'C' &&
          [
            'Открыть',
            'Экспорт отчёта в Excel',
            'Экспорт отчёта в Word',
            'Экспорт предложений в Excel',
            'Экспорт предложений в Word',
            'Создать копию',
            'Переименовать',
            'Удалить',
          ].includes(button.title)
        ) {
          button.disabled = false
        } else if (
          activeOrder.value.evaluation_status === 'C' &&
          ['Сделать итоговым'].includes(button.title) &&
          evalEndedSwitcherAccessPerms.some((perm) => userPermissions.includes(perm))
        ) {
          button.disabled = false
        } else if (
          activeOrder.value.evaluation_type === 'ST' &&
          activeOrder.value.evaluation_status === 'E' &&
          ['Сделка из оценки'].includes(button.title)
        ) {
          button.disabled = false
        } else
          button.disabled = !(
            activeOrder.value.evaluation_status === 'E' &&
            [
              'Открыть',
              'Экспорт отчёта в Excel',
              'Экспорт отчёта в Word',
              'Экспорт предложений в Excel',
              'Экспорт предложений в Word',
              'Создать копию',
            ].includes(button.title)
          )
      }
    })
  },
)
// временная функция для всех пунктов панельных кнопок и контекстного меню
const conLog = () => {
  console.log('function')
}
const exportToExcel = async () => {
  if (activeOrder.value) {
    loading.value = true
    $calculations.setSavedOrderId(activeOrder.value.id)
    await $calculations.openOrder(activeOrder.value.id)
    loading.value = false
    $calculations.exportExcel()
  }
}

const createNewObjectFromEvaluation = async () => {
  if (activeOrder.value) {
    loading.value = true
    $calculations.setSavedOrderId(activeOrder.value.id)
    await $objectStore.createNewObjectFromEvaluation(activeOrder.value.summary_result, activeOrder.value.source.aim)
    loading.value = false
  }
}

const exportOrderToWord = async () => {
  if (activeOrder.value) {
    loading.value = true
    $calculations.setSavedOrderId(activeOrder.value.id)
    $calculations.setOrderName(activeOrder.value.name)
    await $calculations.exportDocs('order', 'docx')
    loading.value = false
  }
}

const exportAnalogsToExcel = async () => {
  if (activeOrder.value) {
    loading.value = true
    $calculations.setSavedOrderId(activeOrder.value.id)
    $calculations.setOrderName(activeOrder.value.name)
    await $calculations.exportDocs('analogs', 'xlsx')
    loading.value = false
  }
}

const exportAnalogsToWord = async () => {
  if (activeOrder.value) {
    loading.value = true
    $calculations.setSavedOrderId(activeOrder.value.id)
    $calculations.setOrderName(activeOrder.value.name)
    await $calculations.exportDocs('analogs', 'docx')
    loading.value = false
  }
}

const getYearAgo = (isoDate: string) => {
  return new Date(new Date(isoDate).setFullYear(new Date(isoDate).getFullYear() - 1)).toISOString().split('T')[0]
}

const getNormalDate = (isoDate: string) => {
  return isoDate.split('T')[0]
}
const isShowAttentionWindow = computed(() => $calculations.isFormChanged && $calculations.currentTabName === evaluation)
const id = computed(() => {
  return $geoObject.noNavigateNewCard ? $objectStore.id!.toString() : route.params.evaluation_id
})
const startNewOrder = () => {
  $calculations.initArraysOfAnalogs()
  $calculations.offIsAllAnalogsInSelection()
  $calculations.setEvaluationType('ST')
  $calculations.setEvaluationStatus('P')
  $calculations.setComparativeApproach(true)
  $calculations.onIsShowStub()
  $calculations.resetOrder()
  useShortAim(id.value).then((res) => {
    $calculations.setAim(res)
    const aim = $calculations.aim
    let searchParams: Record<string, any> = {
      ads_updated__range: [getYearAgo(aim.date_calc), getNormalDate(aim.date_calc)].join(','),
      object_type: aim.object_type,
      ads_type: aim.ads_type,
      // market_type: 'S',
      date_calc: getNormalDate(aim.date_calc),
      // Следующий обязателен для запроса, т.к. используются для сортировки по площади.
      source_area: aim.object_area,
      // Следующие обязательны для запроса, т.к. используются для механизма выбора радиуса.
      lat: aim.geo_pos.coordinates[1],
      lon: aim.geo_pos.coordinates[0],
      // limit: 50,
      // page: 1,
      iteration: '1',
    }
    // if (
    //   fp_ids[aim.object_type][aim.ads_type] &&
    //   functional_purpose_analog[aim.func_purpose.id] in fp_ids[aim.object_type][aim.ads_type]
    // ) {
    //   searchParams.func_purpose__in =
    //     fp_ids[aim.object_type][aim.ads_type][functional_purpose_analog[aim.func_purpose.id]].join(',')
    // } else {
    //   searchParams.func_purpose = String(functional_purpose_analog[aim.func_purpose.id])
    // }
    searchParams.func_purpose = String(functional_purpose_analog[aim.func_purpose.id])
    if (aim.ads_type === 'R') {
      searchParams.land_rights = 'TR'
    } else if (aim.ads_type === 'S') {
      searchParams.land_rights = 'O'
    }
    $calculations.getOrderName()
    $calculations.setRequestParams(searchParams)
    $calculations.onIsShowStub()
    useAimModalFields(aim).then((res: any) => {
      $calculations.setAimModalFields(res)
      $calculations.setAnalogs([])
      $calculations.setSelectedAnalogs([])
      $calculations.getAnalogs().then((res: any) => {
        $calculations.setAnalogsCount(res.rows)
        $calculations.setAllAnalogs(res.results)
        $calculations.setAnalogs(res.results)
        $calculations.updateIsMarketAnalysis(true)
        $calculations.onRunCalculations().then(() => {
          $userStore.setEvaluationComponent('analogs')
        })
      })
    })
  })
}

const startExpressEval = () => {
  $calculations.initArraysOfAnalogs()
  $calculations.setEvaluationType('EX')
  $calculations.setEvaluationStatus('C')
  $calculations.setIsExpress(true)
  $calculations.onIsShowStub()
  $calculations.resetOrder()

  useShortAim(id.value).then((res) => {
    $calculations.setAim(res)
    const aim = $calculations.aim
    let searchParams: Record<string, any> = {
      ads_updated__range: [getYearAgo(aim.date_calc), getNormalDate(aim.date_calc)].join(','),
      object_type: aim.object_type,
      ads_type: aim.ads_type,
      // market_type: 'S',
      func_purpose: functional_purpose_analog[aim.func_purpose.id],
      date_calc: getNormalDate(aim.date_calc),
      // Следующий обязателен для запроса, т.к. используются для сортировки по площади.
      source_area: aim.object_area,
      // Следующие обязательны для запроса, т.к. используются для механизма выбора радиуса.
      lat: aim.geo_pos.coordinates[1],
      lon: aim.geo_pos.coordinates[0],
      // limit: 50,
      // page: 1,
      iteration: '1',
    }
    if (aim.ads_type === 'R') {
      searchParams.land_rights = 'TR'
    } else if (aim.ads_type === 'S') {
      searchParams.land_rights = 'O'
    }
    $calculations.getOrderName()
    $calculations.setRequestParams(searchParams)
    $calculations.onIsShowStub()
    useAimModalFields(aim).then((res: any) => {
      $calculations.setAimModalFields(res)
      $calculations.setAnalogs([])
      $calculations.setSelectedAnalogs([])
      $calculations.getAnalogs().then((res: any) => {
        $calculations.setIsCity(res.is_city)
        $calculations.setSearchRadius(res.radius)
        if (res.is_city) {
          $calculations.setMaxRadius(50.0)
        }
        $calculations.setAnalogsCount(res.rows_filtered)
        $calculations.setAnalogs(res.results)
        $calculations.updateIsMarketAnalysis(true)
        $calculations.onRunCalculations().then(() => {
          if (
            $calculations.finalTableArr.length &&
            $calculations.finalTableArr[$calculations.finalTableArr.length - 1]?.length >= 5
          ) {
            navigateTo(`/evaluation/${$calculations.aim.id}/results`)
          }
        })
      })
    })
  })
}

const startRemoveOrderModal = () => {
  removeOrderModal.value = !removeOrderModal.value
}

const startRenameOrderModal = () => {
  renameOrderModal.value = !renameOrderModal.value
}

const startDuplicateOrderModal = () => {
  duplicateOrderModal.value = !duplicateOrderModal.value
}

const startSetEndStatusOrderModal = () => {
  setOrderEndStatusModal.value = !setOrderEndStatusModal.value
}

const removeOrder = () => {
  if (activeOrder.value) {
    loading.value = true
    $calculations.removeOrder(activeOrder.value.id).then(() => {
      activeOrder.value = null
      $calculations.getOrders(id.value).then(() => (loading.value = false))
    })
  }
}

const makeEnded = () => {
  if (activeOrder.value) {
    loading.value = true
    $calculations.updateOrder(activeOrder.value.id, { evaluation_status: 'E' }).then(() => {
      $calculations.getOrders(id.value).then(() => (loading.value = false))
    })
  }
}

const duplicateOrder = () => {
  if (activeOrder.value) {
    loading.value = true
    $calculations.duplicateOrder(activeOrder.value.id).then(() => {
      activeOrder.value = null
      $calculations.getOrders(id.value).then(() => (loading.value = false))
    })
  }
}

const saveNewOrderName = () => {
  if (activeOrder.value) {
    loading.value = true
    $calculations.updateOrder(activeOrder.value.id, { name: orderName.value }).then(() => {
      $calculations.getOrders(id.value).then(() => (loading.value = false))
      orderName.value = ''
    })
  }
}

const openOrder = async () => {
  if (activeOrder.value) {
    loading.value = true
    $calculations.setSavedOrderId(activeOrder.value.id)
    $calculations.setOrderName(activeOrder.value.name)
    $calculations.setEvaluationType(activeOrder.value.evaluation_type)
    await $calculations.openOrder(activeOrder.value.id).then((res) => {
      $calculations.initAnalogsTemp()
      if (Object.keys(res).length) {
        let isOrderCanBeOpened: boolean = true
        for (const field of orderSourceKeys.source) {
          isOrderCanBeOpened = Object.keys(res.source).includes(field)
          if (!isOrderCanBeOpened) break
        }
        if (isOrderCanBeOpened) {
          for (const field of orderSourceKeys.calc_source) {
            if (field !== 'isAllAnalogsInSelection') {
              isOrderCanBeOpened = Object.keys(res.calc_source).includes(field)
              if (!isOrderCanBeOpened) break
            }
          }
        }
        if (isOrderCanBeOpened) {
          $userStore.setEvaluationComponent('analogs')
          if (!$calculations.finalTableArr.length) {
            $calculations.getFinalTableArr()
          }
          loading.value = false
          navigateTo(`/evaluation/${$calculations.aim.id}/results`)
        }
        if (!isOrderCanBeOpened) {
          loading.value = false
          isAlertInfoOpen.value = true
        }
      }
    })
  }
}

const evalEndedSwitcherAccessPerms = ['EE', 'ADMIN']
const userPermissions: string[] = useUserPermissions($auth.user?.permissions)
const accessDenial = (approach: string) => {
  const accessPerms = ['IS', 'ADMIN']
  if (accessPerms.some((perm) => userPermissions.includes(perm))) return false
  return !userPermissions.includes(approach)
}

// пункты панельных кнопок и контекстного меню с настройками и запуском функций для каждого
const functionalButtonsData = ref([
  {
    type: 'select',
    for: ['panel'],
    title: 'Новый расчет',
    disabled: !$objectStore.isRequiredFieldsReady,
    iconClass: 'icon fi_plus-circle',
    options: [
      {
        title: 'Сравнительный подход',
        disabled: accessDenial('ST'),
        iconClass: 'icon fi_scale-left',
        function: startNewOrder,
      },
      { title: 'Доходный подход', disabled: true, iconClass: 'icon fi_scale-left', function: conLog },
      { title: 'Затратный подход', disabled: true, iconClass: 'icon fi_scale-left', function: conLog },
      {
        title: 'Экспресс-оценка',
        disabled: accessDenial('EX'),
        iconClass: 'icon fi_scale-left',
        function: startExpressEval,
      },
    ],
  },
  {
    type: 'button',
    for: ['panel', 'ctx'],
    title: 'Открыть',
    disabled: true,
    iconClass: 'icon fi_file-open',
    function: openOrder,
  },
  {
    type: 'select',
    for: ['panel'],
    title: 'Экспорт',
    disabled: true,
    iconClass: 'icon fi_file_export',
    options: [
      { title: 'Отчёта в Excel', disabled: true, iconClass: 'icon fi_file_excel', function: exportToExcel },
      { title: 'Отчёта в Word', disabled: true, iconClass: 'icon fi_file_word', function: exportOrderToWord },
      { title: 'Предложений в Excel', disabled: true, iconClass: 'icon fi_file_excel', function: exportAnalogsToExcel },
      { title: 'Предложений в Word', disabled: true, iconClass: 'icon fi_file_word', function: exportAnalogsToWord },
    ],
  },
  {
    type: 'button',
    for: ['ctx'],
    title: 'Экспорт отчёта в Excel',
    disabled: true,
    iconClass: 'icon fi_file_excel',
    function: exportToExcel,
  },
  {
    type: 'button',
    for: ['ctx'],
    title: 'Экспорт отчёта в Word',
    disabled: true,
    iconClass: 'icon fi_file_word',
    function: exportOrderToWord,
  },
  {
    type: 'button',
    for: ['ctx'],
    title: 'Экспорт предложений в Excel',
    disabled: true,
    iconClass: 'icon fi_file_excel',
    function: exportAnalogsToExcel,
  },
  {
    type: 'button',
    for: ['ctx'],
    title: 'Экспорт предложений в Word',
    disabled: true,
    iconClass: 'icon fi_file_word',
    function: exportAnalogsToWord,
  },
  {
    type: 'button',
    for: ['panel', 'ctx'],
    title: 'Создать копию',
    disabled: true,
    iconClass: 'icon fi_copy',
    function: startDuplicateOrderModal,
  },
  {
    type: 'button',
    for: ['ctx'],
    title: 'Сделка из оценки',
    disabled: true,
    iconClass: 'icon fi_copy-eval2deal',
    function: () => (isOpenMakeDealObjectModal.value = true),
  },
  {
    type: 'button',
    for: ['panel', 'ctx'],
    title: 'Сделать итоговым',
    disabled: true,
    iconClass: 'icon fi_lock',
    function: startSetEndStatusOrderModal,
  },
  {
    type: 'button',
    for: ['panel', 'ctx'],
    title: 'Переименовать',
    disabled: true,
    iconClass: 'icon fi_edit-3',
    function: startRenameOrderModal,
  },
  {
    type: 'button',
    for: ['panel', 'ctx'],
    title: 'Удалить',
    disabled: true,
    iconClass: 'icon fi_trash',
    function: startRemoveOrderModal,
  },
])

onMounted(() => {
  loading.value = true
  $calculations.setSavedOrderId(null)
  $calculations.getOrders(id.value).then(() => (loading.value = false))
  console.log('user-log', $auth.user)
})

const closeAttention = () => {
  $calculations.setCurrentTabName('')
}
</script>
