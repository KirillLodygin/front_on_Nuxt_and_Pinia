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
    title="СВОЙСТВА КАТАЛОГА"
    @ok="emitAcceptParameters"
  >
    <div class="modal-item d-flex flex-column">
      <label for="title">Название</label>
      <input type="text" name="title" v-model="dataValue.name" :maxlength="25" @input="onNameInput" />
      <span class="text-danger" v-if="isNameTooLong">Название ограниченно 25-ю символами</span>
    </div>
    <div class="modal-item d-flex flex-column">
      <label for="description">Описание</label>
      <textarea name="description" v-model="dataValue.description" />
    </div>
    <div class="modal-item d-flex flex-column">
      <label for="path-catalog">Путь к каталогу</label>
      <input type="text" name="path-catalog" :value="pathCatalog" disabled />
    </div>

    <div class="wrapper d-flex w-100">
      <div class="modal-item d-flex flex-column w-100">
        <label for="title">Дата создания</label>
        <input type="text" name="title" :value="date('added_date')" disabled />
      </div>

      <div class="modal-item d-flex flex-column w-100">
        <label for="title">ФИО создавшего</label>
        <input type="text" name="title" :value="user(dataValue.added_by)" disabled />
      </div>
    </div>

    <div class="wrapper d-flex w-100">
      <div class="modal-item d-flex flex-column w-100">
        <label for="title">Дата обновления в системе</label>
        <input type="text" name="title" :value="date('modified_date')" disabled />
      </div>

      <div class="modal-item d-flex flex-column w-100">
        <label for="title">ФИО обновившего</label>
        <input type="text" name="title" :value="user(dataValue.modified_by)" disabled />
      </div>
    </div>
  </BModal>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { cloneDeep } from 'lodash'
import { useNuxtApp } from 'nuxt/app'
import type { PropType } from 'vue'

interface User {
  value: string
  display_name: string
}

const { $catalogsTable }: any = useNuxtApp()

const props = defineProps({
  modelValue: Boolean,
  dataFolder: {
    type: Object as PropType<{
      ads_downloaded: Date
      ads_updated_internal: Date
      added_by: string
      modified_by: string
    }>,
    required: true,
  },
  users: {
    type: Array as PropType<User[]>,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'acceptParameters'])
const dataValue: any = ref(cloneDeep(props.dataFolder))
const pathCatalog = ref('')

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

watch(
  () => props.dataFolder,
  (newDataFolder) => {
    dataValue.value = cloneDeep(newDataFolder)
    pathCatalog.value = $catalogsTable.getPathFolder(dataValue.value)
  },
  { immediate: true },
)

const isNameTooLong = ref(false)

const onNameInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  isNameTooLong.value = input.value.length >= 25
  if (isNameTooLong.value) {
    input.value = input.value.slice(0, 25)
    dataValue.value.name = input.value
  }
}

const date = (type: 'added_date' | 'modified_date') => {
  const dateValue =
    type === 'added_date' ? dataValue.value.added_date : dataValue.value.modified_date || dataValue.value.added_date
  const date = new Date(dateValue)
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return date.toLocaleDateString('ru-RU', options)
}

const user = (userItem: any) => {
  if (!userItem) return
  return props.users.find((obj) => obj.value === userItem.toString())?.display_name
}

const emitAcceptParameters = () => {
  emit('acceptParameters', dataValue.value)
}
</script>

<style lang="scss" scoped>
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
