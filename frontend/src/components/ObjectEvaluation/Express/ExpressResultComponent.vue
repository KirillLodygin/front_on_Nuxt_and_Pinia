<template>
  <ExpressResult />
  <ModalMessage v-model="isAlert" :okOnly="true" title=""> Сохранение прошло успешно </ModalMessage>
  <hr ref="evaluationStagesFooterHrRef" class="m-2" />
  <div ref="evaluationStagesFooterButtonsRef">
    <EvaluationStagesFooterButtons @isEvaluationSave="isEvaluationSave" :active-tab-index="0" :tabs="[]" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import ExpressResult from '~/components/ObjectEvaluation/Express/ExpressResult.vue'
import EvaluationStagesFooterButtons from '~/components/ObjectEvaluation/Evaluations/EvaluationStagesFooterButtons.vue'
import ModalMessage from '~/components/UI-KIT/Alerts/ModalMessage.vue'

const isAlert = ref(false)

const isEvaluationSave = () => {
  isAlert.value = true
}
</script>
