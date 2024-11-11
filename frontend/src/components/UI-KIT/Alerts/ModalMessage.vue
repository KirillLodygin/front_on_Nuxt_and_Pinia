<!--
    Выводит сообщение с иконкой для модального окна
-->
<template>
  <BModal
    v-model="toggle"
    :bodyClass="props.bodyClass"
    :cancelTitle="props.cancelTitle"
    :cancelVariant="props.cancelVariant"
    :centered="props.centered"
    :title="props.title"
    :class="[{ 'd-block': displaySwitcher }, { 'd-none': !displaySwitcher }]"
    :contentClass="[props.variant ? 'border-' + props.variant : '', props.contentClass]"
    :headerVariant="props.headerVariant || props.variant"
    :okOnly="props.okOnly"
    :okTitle="getOkTitle()"
    :okVariant="getOkVariant()"
    :size="props.size"
  >
    <template v-if="props.titleIcon" #title>
      <div class="col h5 my-1">
        <i :class="['icon', 'icon-lg', 'me-1', 'bg-cur-color', props.titleIcon]"></i> {{ props.title }}
      </div>
    </template>

    <div class="d-flex mb-4">
      <div v-if="!props.withoutIcon" class="me-4">
        <i :class="['icon icon-3x modal-icon', props.icon]"></i>
      </div>
      <div class="w-100">
        <slot>
          {{ props.label }}
        </slot>
      </div>
    </div>
    <template #footer="{ ok, cancel }">
      <slot name="footer" v-bind="{ ok, cancel }">
        <div v-if="props.showAgain !== null" class="form-check me-auto">
          <input :id="showAgainCheckId" v-model="showAgainToggle" class="form-check-input" type="checkbox" />
          <label
            :for="showAgainCheckId"
            :style="!props.size || props.size === 'sm' || props.size === 'md' ? 'width: 180px' : ''"
            class="form-check-label"
          >
            Не показывать больше это сообщение
          </label>
        </div>
        <button
          v-if="!props.okOnly"
          :class="'btn btn-md btn-' + props.cancelVariant"
          type="button"
          @click="
            () => {
              emit('rejectAction')
              cancel()
            }
          "
        >
          {{ props.cancelTitle }}
        </button>
        <button
          :class="'btn btn-md btn-' + getOkVariant()"
          type="button"
          @click="
            () => {
              emit('closeAlertInfo')
              ok()
            }
          "
        >
          {{ getOkTitle() }}
        </button>
      </slot>
    </template>
  </BModal>
</template>

<script lang="ts" name="ModalMessage" setup>
import { computed } from 'vue'

const props = defineProps({
  // Переопределение некоторых свойств BModal
  modelValue: { type: Boolean, default: false },
  centered: { type: Boolean, default: true },
  bodyClass: { type: String, default: 'mt-3 mx-2' },
  contentClass: { type: String, required: false },
  title: { type: String, required: false },
  okTitle: { type: String, required: false },
  okVariant: { type: String as PropType<any>, required: false },
  okOnly: { type: Boolean, default: false },
  cancelTitle: { type: String, default: 'Отмена' },
  cancelVariant: { type: String as PropType<any>, default: 'outline-secondary' },
  headerVariant: { type: String as PropType<any>, required: false },
  size: { type: String as PropType<any>, required: false },
  // Класс для иконки в заголовке окна
  titleIcon: { type: String, default: null },
  // Цветовое оформление
  variant: { type: String, required: false },
  // Показывать флажок "Не показывать больше это сообщение", использовать через v-modal:showAgain
  showAgain: { type: Boolean, default: null },
  // Название иконки
  icon: { type: String, default: 'fi_alert-triangle' },
  withoutIcon: { type: Boolean, default: false },
  // Текст. Используется, если не задан слот по умолчанию
  label: { type: String, default: 'Текст сообщения' },
})

const emit = defineEmits(['update:modelValue', 'update:showAgain', 'closeAlertInfo', 'rejectAction', 'onCloseWindow'])
const toggle = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('onCloseWindow')
    emit('update:modelValue', value)
  },
})
const showAgainToggle = computed({
  get: () => !props.showAgain,
  set: (value) => emit('update:showAgain', !value),
})

const showAgainCheckId = ref('')
const displaySwitcher = ref(false)

watch(
  () => toggle.value,
  () => {
    setTimeout(() => {
      displaySwitcher.value = toggle.value
    }, 100)
  },
)

onMounted(() => {
  const instance = getCurrentInstance()
  if (instance) {
    showAgainCheckId.value = 'show-again-' + instance.uid
  }
})

const getOkTitle = () => {
  return props.okTitle ? props.okTitle : props.okOnly ? 'Закрыть' : 'Подтвердить'
}

const getOkVariant = () => {
  return props.okVariant ? props.okVariant : props.okOnly ? 'secondary' : 'primary'
}
</script>
