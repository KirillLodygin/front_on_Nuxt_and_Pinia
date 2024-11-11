<template>
  <LoadingCover v-if="$calculations.isShowStub"></LoadingCover>
  <OrdersComponent v-if="$userStore.evaluationComponent === 'orders' && !$calculations.isShowStub" />
  <AnalogsComponent v-if="$userStore.evaluationComponent === 'analogs' && !$calculations.isShowStub" />
  <ModalMessage v-model="analogsNotFoundModal" :okOnly="true" size="lg" title="ИНФОРМАЦИЯ">
    {{ computedMessage }}
  </ModalMessage>
</template>

<script lang="ts" setup>
import AnalogsComponent from '~/components/ObjectEvaluation/AnalogsComponents/AnalogsComponent.vue'
import OrdersComponent from '~/components/ObjectEvaluation/OrdersComponents/OrdersComponent.vue'
import ModalMessage from '~/components/UI-KIT/Alerts/ModalMessage.vue'
import LoadingCover from '~/components/UI-KIT/Loaders/LoadingCover.vue'

const { $userStore, $calculations } = useNuxtApp()

const analogsNotFoundModal = ref(false)
const setAnalogsNotFoundModal = (bool: boolean) => {
  analogsNotFoundModal.value = bool
}
const computedMessage = computed(() => {
  if ($calculations.isExpress) {
    return 'К сожалению, мы не смогли выполнить расчет для региона Вашего объекта анализа. Обратитесь в поддержу.'
  }
  return (
    'Подходящие предложения не найдены. С помощью кнопок на панели инструментов ' +
    'Вы можете самостоятельно добавить новые предложения или выбрать существующие из списка.'
  )
})

watch(
  [
    () => $userStore.evaluationComponent,
    () => $calculations.isShowStub,
    () => $calculations.analogs.length,
    () => $calculations.finalTableArr.length,
    () => $calculations.finalTableArr[$calculations.finalTableArr.length - 1]?.length,
  ],
  () => {
    if (
      ($userStore.evaluationComponent === 'analogs' && !$calculations.isShowStub && !$calculations.analogs.length) ||
      ($calculations.isExpress &&
        !$calculations.isShowStub &&
        (!$calculations.finalTableArr.length ||
          !$calculations.finalTableArr[$calculations.finalTableArr.length - 1].length ||
          $calculations.finalTableArr[$calculations.finalTableArr.length - 1].length < 5))
    )
      setAnalogsNotFoundModal(true)
  },
)
</script>
