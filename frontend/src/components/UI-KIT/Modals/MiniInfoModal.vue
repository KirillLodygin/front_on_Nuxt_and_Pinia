<template>
  <BModal
    v-model="toggle"
    :class="{ 'd-block': toggle }"
    centered
    :hideHeaderClose="true"
    :size="size"
    titleClass="w-100"
    @hide="onHide"
  >
    <template v-if="!!title" #title>
      <div class="row">
        <div class="col h5 my-1"><i class="icon icon-lg" :class="icon"></i>{{ ` ${title}` }}</div>
        <div class="col text-end">
          <button
            aria-label="Close"
            class="btn-close"
            data-v-079b865c=""
            type="button"
            @click="onCloseModelValue()"
          ></button>
        </div>
      </div>
    </template>
    <slot name="content"></slot>
    <template #footer="{ ok, cancel }">
      <div>
        <button
          class="btn btn-lg btn-outline-secondary p-3 btn-footer me-2"
          @click="
            () => {
              onRefuseChanges()
              cancel()
            }
          "
        >
          Отмена
        </button>
      </div>
      <div>
        <button class="btn btn-lg btn-primary p-3 btn-footer me-2" @click="onSaveChanges()" :disabled="disabled">
          {{ footerBtnTitle ? footerBtnTitle : 'Ok' }}
        </button>
      </div>
    </template>
  </BModal>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { type Size } from 'bootstrap-vue-next'

interface Props {
  modelValue: boolean
  title?: string
  icon?: string
  footerBtnTitle?: string
  centered?: boolean
  size?: Size | 'xl' | undefined
  disabled?: boolean | false
}

const props = defineProps<Props>()

const emit = defineEmits(['update:modelValue', 'onCloseModelValue', 'onRefuseChanges', 'onSaveChanges'])

const toggle = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const onHide = () => {
  emit('onCloseModelValue')
}

const onCloseModelValue = () => {
  emit('onCloseModelValue')
}

const onRefuseChanges = () => {
  emit('onRefuseChanges')
}

const onSaveChanges = () => {
  emit('onSaveChanges')
  emit('onCloseModelValue')
}
</script>
