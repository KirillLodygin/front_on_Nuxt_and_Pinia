<template>
  <BModal
    v-model="value"
    :class="{ 'd-block': value }"
    centered
    content-class=""
    dialog-class=""
    modal-class="modal-features-catalog"
    cancel-title="Отмена"
    cancel-variant="outline-dark"
    ok-title="Сохранить"
    title="ДОБАВИТЬ КАТАЛОГ"
    @ok="acceptParameters(dataValue)"
  >
    <div class="modal-item d-flex flex-column">
      <label for="name">Название</label>
      <input type="text" name="name" v-model="dataValue.name" :maxlength="25" @input="onNameInput" />
      <span class="text-danger" v-if="isNameTooLong">Название ограниченно 25-ю символами</span>
    </div>
    <div class="modal-item d-flex flex-column">
      <label for="description">Описание</label>
      <textarea name="description" v-model="dataValue.description" />
    </div>
  </BModal>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue', 'acceptParameters'])

const initialDataValue = ref({
  name: '',
  description: '',
})

const dataValue = ref({
  name: '',
  description: '',
})

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const isNameTooLong = ref(false)

const onNameInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.value.length >= 25) {
    isNameTooLong.value = true
    input.value = input.value.slice(0, 25)
    dataValue.value.name = input.value
  } else {
    isNameTooLong.value = false
  }
}

const acceptParameters = (data: any) => {
  emit('acceptParameters', data)
  dataValue.value = initialDataValue.value
}
</script>

<style lang="scss">
.modal-features-catalog {
  flex-direction: column;

  .modal-dialog {
    width: calc(100% - 2rem);
    max-width: 68.75rem;

    .modal-header {
      padding: 1rem 1.125rem 1rem 1.75rem;

      .modal-title {
        font-size: 1.5rem;
        font-weight: 400;
        line-height: 150%;
        color: rgb(0, 0, 0);
      }
    }

    .modal-body {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      .wrapper {
        gap: 1.25rem;
        padding-top: 1rem;
      }

      .modal-item {
        gap: 0.625rem;

        input {
          padding: 1rem;
          border-radius: 0.31rem;
          border: 0.06rem solid rgb(0, 0, 0);

          &:disabled {
            background: rgb(241, 242, 243);
            border: 0.06rem solid rgb(134, 141, 146);
          }
        }

        textarea[name='description'] {
          min-height: 5.5rem;
          padding: 1rem;
          border-radius: 0.31rem;
          border: 0.06rem solid rgb(0, 0, 0);
          resize: none;
        }
      }
    }

    .modal-footer {
      justify-content: space-between;
    }
  }
}
</style>
