<template>
  <div class="row p-0 h-100">
    <div class="col">
      <ButtonWithLoader
        :value="
          $calculations.evaluationType === 'EX' || $calculations.evaluationStatus === 'E'
            ? 'Вернуться'
            : 'Вернуться к выбору предложений'
        "
        button-class="px-4 fixed-fs-17"
        height="100%"
        start-icon-class="icon fi_arrow-left me-2"
        variant="outline-secondary"
        @click="
          () => {
            if ($calculations.evaluationType === 'EX' || $calculations.evaluationStatus === 'E') {
              $userStore.setEvaluationComponent('orders')
              $calculations.setOrderName('')
              $calculations.setIsExpress(false)
              $calculations.setAnalogs([])
              $calculations.setAnalogsTemp([])
              $calculations.initFinalTableArr()
              $calculations.setSavedOrderId(null)
            }
            navigateTo(`/evaluation/${$calculations.aim.id}#Расчёты`)
          }
        "
      />
    </div>
    <div class="col-9 d-flex gap-2 justify-content-end h-100">
      <ButtonWithLoader
        v-if="activeTabIndex !== 0 && $calculations.evaluationType !== 'EX' && $calculations.evaluationStatus !== 'E'"
        button-class="px-4 fixed-fs-17"
        value="Сбросить вычисления"
        variant="outline-secondary"
        @click="
          () => {
            console.log('Сбросить вычисления')
            navigateToResults()
          }
        "
      />
      <BDropdown
        v-if="activeTabIndex === props.tabs.length - 1 || $calculations.evaluationType === 'EX'"
        v-model="exportDropUp"
        class="me-2"
        dropup
        text="Экспорт"
        variant="outline-secondary"
      >
        <BDropdownItem
          v-if="activeTabIndex === props.tabs.length - 1 || $calculations.evaluationType === 'EX'"
          @click="
            () => {
              console.log('Отчёта в Excel ')
              $calculations.initFinalTableArr()
              $calculations.exportExcel()
            }
          "
        >
          Отчёта в Excel
        </BDropdownItem>
        <BDropdownItem
          v-if="
            (activeTabIndex === props.tabs.length - 1 || $calculations.evaluationType === 'EX') &&
            $calculations.savedOrderId
          "
          @click="
            () => {
              console.log('Отчёта в Word')
              $calculations.exportDocs('order', 'docx')
            }
          "
        >
          Отчёта в Word
        </BDropdownItem>
        <BDropdownItem
          v-if="
            (activeTabIndex === props.tabs.length - 1 || $calculations.evaluationType === 'EX') &&
            $calculations.savedOrderId
          "
          @click="
            () => {
              console.log('Предложений в Excel')
              $calculations.exportDocs('analogs', 'xlsx')
            }
          "
        >
          Предложений в Excel
        </BDropdownItem>
        <BDropdownItem
          v-if="
            (activeTabIndex === props.tabs.length - 1 || $calculations.evaluationType === 'EX') &&
            $calculations.savedOrderId
          "
          @click="
            () => {
              console.log('Предложений в Word')
              $calculations.exportDocs('analogs', 'docx')
            }
          "
        >
          Предложений в Word
        </BDropdownItem>
      </BDropdown>
      <ButtonWithLoader
        v-if="$calculations.evaluationStatus !== 'E'"
        :loading="saving"
        :variant="activeTabIndex !== props.tabs.length - 1 ? 'outline-secondary' : 'primary'"
        button-class="px-4 fixed-fs-17"
        value="Сохранить"
        @click="() => evaluationSave()"
      />
      <ButtonWithLoader
        v-if="activeTabIndex > 0"
        :value="props.tabs[activeTabIndex - 1]"
        button-class="px-4 fixed-fs-17"
        start-icon-class="icon fi_chevron-left"
        variant="outline-secondary"
        @click="() => $calculations.decreaseActiveTabindex()"
      />
      <ButtonWithLoader
        v-if="activeTabIndex < props.tabs.length - 1"
        :disabled="isBlockRunCalculations"
        :value="props.tabs[activeTabIndex + 1]"
        button-class="px-4 fixed-fs-17"
        end-icon-class="icon fi_chevron-right"
        @click="() => getNewCalculationsStep()"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { navigateTo, useNuxtApp } from 'nuxt/app'
import { isEmpty } from 'lodash'
import ButtonWithLoader from '~/components/UI-KIT/Buttons/BaseFormButton.vue'

interface Props {
  tabs: Array<string>
}

const props = defineProps<Props>()

const emit = defineEmits(['setActiveTabindex', 'isEvaluationSave'])
const { $calculations, $userStore } = useNuxtApp()
const saving = ref(false)
const exportDropUp = ref(false)
const isBlockRunCalculations = computed(() => $calculations.getIsBlockRunCalculations())
const order = computed(() => $calculations.order)
const activeTabIndex = computed(() => $calculations.activeTabIndex)
const selectedAnalogs = computed(() => $calculations.selectedAnalogs)
const adjustableFields = computed(() => $calculations.adjustableFields)
const fieldsWithValuesAccordingGuideArray = computed(() => $calculations.fieldsWithValuesAccordingGuideArray)

const getNewCalculationsStep = () => {
  activeTabIndex.value === 0 &&
  (isEmpty(order.value) ||
    order.value.source?.activeTabIndex === 0 ||
    order.value.source?.selectedAnalogs.length > selectedAnalogs.value.length)
    ? $calculations.onRunCalculations().then(() => {
        $calculations.increaseActiveTabindex()
      })
    : $calculations.increaseActiveTabindex()
}

const evaluationSave = async () => {
  saving.value = true
  if (activeTabIndex.value === props.tabs.length - 1 || $calculations.evaluationType === 'EX') {
    $calculations.createSummaryResult()
    await $calculations.setEvaluationStatus('C')
  } else {
    await $calculations.setEvaluationStatus('P')
  }
  $calculations.evaluationSave().then(() => {
    saving.value = false
    emit('isEvaluationSave')
  })
}

const navigateToResults = async () => {
  await $calculations.navigateToResults()
  navigateTo(`/evaluation/${$calculations.aim.id}/results`)
}
</script>
