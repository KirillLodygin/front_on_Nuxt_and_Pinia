<template v-if="isResults">
  <div ref="evaluationStagesTabsRef">
    <EvaluationStagesTabs :active-tab-index="activeTabIndex" :tabs="EvaluationsStagesTabs" />
  </div>
  <div :style="{ height: computedHeight }">
    <div v-if="isShowStub" class="table-load-bg">
      <div class="table-load">
        <div class="spinner-border" role="status"></div>
        <div>Загрузка данных...</div>
      </div>
    </div>
    <StageOneBlock v-else-if="activeTabIndex === 0 && !isShowStub" />
    <StageTwoBlock v-else :tabs="EvaluationsStagesTabs" />
  </div>
  <ModalMessage v-model="isAlert" :okOnly="true" title=""> Сохранение прошло успешно </ModalMessage>
  <hr ref="evaluationStagesFooterHrRef" class="m-2" />
  <div ref="evaluationStagesFooterButtonsRef">
    <EvaluationStagesFooterButtons @isEvaluationSave="isEvaluationSave" :tabs="EvaluationsStagesTabs" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import StageOneBlock from '~/components/ObjectEvaluation/Evaluations/StageOneBlock.vue'
import EvaluationStagesTabs from '~/components/ObjectEvaluation/Evaluations/EvaluationStagesTabs.vue'
import EvaluationStagesFooterButtons from '~/components/ObjectEvaluation/Evaluations/EvaluationStagesFooterButtons.vue'
import StageTwoBlock from '~/components/ObjectEvaluation/Evaluations/StageTwoBlock/StageTwoBlock.vue'
import ModalMessage from '~/components/UI-KIT/Alerts/ModalMessage.vue'

const { $calculations, $userStore } = useNuxtApp()

const isAlert = ref(false)

const activeTabIndex = computed(() => $calculations.activeTabIndex)
const isResults = computed(() => $calculations.aim?.id)
const EvaluationsStagesTabs = computed(() => $calculations.evaluationsStagesTabs)
const isShowStub = computed(() => $calculations.isShowStub)

onMounted(() => {
  if (!isResults.value) {
    const route = useRoute()
    const path = route.path.split('/').slice(0, -1)
    navigateTo({ path: path.join('/'), hash: 'Расчёты' })
  }
})

const evaluationStagesTabsRef = ref<HTMLElement | null>(null)
const evaluationStagesFooterButtonsRef = ref<HTMLElement | null>(null)
const evaluationStagesFooterHrRef = ref<HTMLElement | null>(null)
const computedHeight = ref<string>('')

const resizeObserver = new ResizeObserver(() => {
  const parent = document.querySelector('.map-object-properties_body_content') as HTMLElement
  if (
    parent &&
    evaluationStagesTabsRef.value &&
    evaluationStagesFooterButtonsRef.value &&
    evaluationStagesFooterHrRef.value
  ) {
    const tableHeight =
      parent.clientHeight -
      evaluationStagesTabsRef.value.clientHeight -
      evaluationStagesFooterButtonsRef.value.clientHeight -
      evaluationStagesFooterHrRef.value.clientHeight -
      22
    computedHeight.value = `${tableHeight}px`
  }
})

onMounted(() => {
  if (evaluationStagesTabsRef.value) resizeObserver.observe(evaluationStagesTabsRef.value)
  if (evaluationStagesFooterButtonsRef.value) resizeObserver.observe(evaluationStagesFooterButtonsRef.value)
  if (evaluationStagesFooterHrRef.value) resizeObserver.observe(evaluationStagesFooterHrRef.value)
})

onBeforeUnmount(() => {
  if (evaluationStagesTabsRef.value) resizeObserver.unobserve(evaluationStagesTabsRef.value)
  if (evaluationStagesFooterButtonsRef.value) resizeObserver.unobserve(evaluationStagesFooterButtonsRef.value)
  if (evaluationStagesFooterHrRef.value) resizeObserver.unobserve(evaluationStagesFooterHrRef.value)
})

const isEvaluationSave = () => {
  isAlert.value = true
}
</script>
