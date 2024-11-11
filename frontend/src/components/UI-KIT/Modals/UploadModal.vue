<template>
  <BModal v-model="visible" :class="{ 'd-block': visible }" centered :title="schema.title || 'Заголовок окна'">
    <BForm v-if="schema.inputs">
      <h5 v-if="uploaded" class="p-2 text-center">{{ schema.success }}</h5>
      <div v-else class="row">
        <div v-for="input in schema.inputs" :key="input.name" :class="'col-' + (input.cols ? input.cols : '12')">
          <div v-if="input.visible == null || input.visible" class="mb-3">
            <div v-if="input.mode === 'info-input'"><i class="fas fa-info-circle"></i> {{ input.label }}</div>
            <template v-else>
              <label v-if="input.mode !== 'BFormFile'" :for="inputId(input)">{{
                  input.label + (input.required ? ' *' : '')
                }}</label>
              <div v-else>
                <label :for="inputId(input)">
                  <div v-if="input.label" class="form-label">{{ input.label + (input.required ? ' *' : '') }}</div>
                  <div class="references-modal-files-div input-group-text bg-white justify-content-between p-0">
                    <span class="p-2 text-nowrap overflow-hidden text-truncate">{{
                        fileName ? fileName : input.placeholder
                      }}</span>
                    <span class="border-start p-2">Выбрать</span>
                  </div>
                </label>
              </div>
              <Component
                :is="input.mode"
                :id="inputId(input)"
                v-model="values[input.name]"
                :type="input.type"
                :style="input.style"
                :input="input"
                :state="states[input.name]"
                :schema="schema"
                :options="input.options"
                :placeholder="input.placeholder"
                :class="{
                  'field field__file': input.mode === 'BFormFile',
                }"
                @change="onChange"
                @click="postNewFile"
              ></Component>
              <transition name="fade">
                <div>
                  <div v-if="errorFile" class="alert alert-danger d-flex mt-3">
                    <i class="icon icon-xl fi_alert-octagon flex-shrink-0 me-3"></i>
                    <div :class="errorFile ? 'show-text' : 'hide-text'">
                      {{ schema.errorFileText }}
                    </div>
                  </div>
                  <div v-if="responseError" class="errorTextBlock">
                    <p :class="responseError ? 'show-text' : 'hide-text'">
                      <strong>{{ errors[errorName] }}</strong>
                    </p>
                  </div>
                </div>
              </transition>
              <BFormInvalidFeedback
                v-if="input.mode !== 'BFormFile'"
                :id="inputId(input) + '-feedback'"
                :state="states[input.name]"
              >{{ errors[input.name] }}</BFormInvalidFeedback
              >
            </template>
          </div>
        </div>
      </div>
      <div v-if="formErrors.length" class="alert alert-danger d-flex mt-2">
        <i class="icon icon-xl fi_alert-octagon flex-shrink-0 me-3"></i>
        <div v-for="(formError, index) in formErrors" :key="index">
          {{ formError }}
        </div>
      </div>
    </BForm>
    <template #footer>
      <!-- Если файл загружен, показываем только кнопку "Загрузить еще" -->
      <BButton v-if="uploaded" type="button" variant="primary" @click="resetUploadState"> Загрузить еще </BButton>
      <div v-else>
        <BButton type="submit" variant="primary" :disabled="checking || !fileName.length" @click="send">
          {{ schema.submit || 'Отправить' }}
          <BSpinner v-if="loading" :small="true" />
        </BButton>
      </div>
    </template>
  </BModal>
</template>

<script>
import { ref, reactive, getCurrentInstance } from 'vue'
import { BFormInput, BFormSelect, BFormTextarea, BFormFile } from 'bootstrap-vue-next'

export default {
  name: 'UploadModal',
  components: {
    BFormInput,
    BFormSelect,
    BFormTextarea,
    BFormFile,
  },
  props: {
    schema: { type: Object, required: true },
  },
  setup(props, { emit }) {
    const obj = ref(null)
    const visible = ref(false)
    const checking = ref(false)
    const loading = ref(false)
    const values = reactive({})
    const states = reactive({})
    const errors = reactive({})
    const formErrors = ref([])
    const fileName = ref('')
    const manifest = ref(true)
    const errorFile = ref(false)
    const responseError = ref(false)
    const errorName = ref('')
    const uploaded = ref(false)

    const { proxy } = getCurrentInstance()
    const $http = proxy.$http

    function inputId(input) {
      return props.schema.name + '-' + input.name
    }

    function show(objParam) {
      resetFields()
      obj.value = objParam
      if (objParam) setObject(objParam)
      formErrors.value = []
      visible.value = true
    }

    function close() {
      visible.value = false
      fileName.value = ''
      manifest.value = true
      errorFile.value = false
      checking.value = false
    }

    function resetFields() {
      Object.keys(states).forEach((key) => delete states[key])
      Object.keys(errors).forEach((key) => delete errors[key])
      Object.keys(values).forEach((key) => delete values[key])

      if (props.schema.inputs) {
        Object.keys(props.schema.inputs).forEach((name) => {
          states[name] = null
          errors[name] = ''
          if (props.schema.values && name in props.schema.values) {
            values[name] = props.schema.values[name]
          }
        })
      }
    }

    function resetUploadState() {
      uploaded.value = false
      loading.value = false
      checking.value = false
      values.file_uploaded = ''
      fileName.value = ''
      resetFields()
    }

    function setObject(objParam) {
      Object.keys(props.schema.inputs).forEach((name) => {
        if (
          props.schema.inputs[name].style &&
          objParam.style &&
          objParam.style[name]
        ) {
          values[name] = objParam.style[name]
        } else if (name in objParam) {
          values[name] = objParam.values ? objParam.values[name] : objParam[name]
        }
      })
    }

    async function send() {
      checking.value = true
      loading.value = true
      formErrors.value = []

      const formData = new FormData()
      const formDataTest = new FormData()
      let style = {}

      Object.keys(props.schema.inputs).forEach((name) => {
        if (name in values && values[name] == null) formData.append(name, '')
        else if (props.schema.inputs[name].style) style[name] = values[name]
        else if (name in values) formData.append(name, values[name])
        else if (props.schema.values && name in props.schema.values) formData.append(name, props.schema.values[name])
        states[name] = null
      })
      formData.append('style', JSON.stringify(style))
      if (obj.value?.values?.tn_parent) {
        formData.append('tn_parent', obj.value.values.tn_parent)
      }
      formDataTest.append('file_uploaded', values.file_uploaded)
      let response

      try {
        if (obj.value && !obj.value.layerPost) {
          response = await $http.put(props.schema.action + obj.value.id + '/', formData)
        } else if (values.file_uploaded) {
          response = await $http.post(props.schema.action, formDataTest)
        } else {
          response = await $http.post(props.schema.action, formData)
        }
        loading.value = false
        uploaded.value = true
        setTimeout(() => {
          checking.value = false
        }, 2000)
        emit('success')
      } catch (error) {
        catchError(error)
      }
    }

    function catchError(error) {
      checking.value = false
      errorFile.value = false
      loading.value = false
      if (error.response) {
        if (error.response.data) {
          if (typeof error.response.data === 'string' || error.response.data instanceof String) {
            formErrors.value.push('Сервер вернул ошибку: "' + error.response.data + '"')
          } else if (typeof error.response.data === 'object') {
            Object.keys(props.schema.inputs).forEach((name) => {
              if (name in error.response.data) {
                if (name === 'file_uploaded' || name === 'map_info_file') {
                  responseError.value = true
                  errorName.value = name
                }
                states[name] = false
                errors[name] = error.response.data[name].join('; ')
              }
            })
          }
        } else {
          formErrors.value.push('Произошла ошибка при обращении к серверу')
        }
      } else {
        formErrors.value.push('Не удалось соединиться с сервером')
      }
    }

    function onChange(e) {
      if (e.target) {
        const { id } = e.target
        if (id) {
          fileName.value = e.target.files[0].name
          if (
            id === 'newReportingInputForm-file_uploaded' &&
            !fileName.value.includes('.xlsx') &&
            !fileName.value.includes('.xlx') &&
            !fileName.value.includes('.zip')
          ) {
            errorFile.value = true
            checking.value = true
          }
        }
        responseError.value = false
        errorName.value = ''
      }
    }

    function postNewFile() {
      values.file_uploaded = ''
      fileName.value = ''
      formErrors.value = []
      errorFile.value = false
      checking.value = false
    }

    return {
      obj,
      visible,
      checking,
      loading,
      values,
      states,
      errors,
      formErrors,
      fileName,
      manifest,
      errorFile,
      responseError,
      errorName,
      uploaded,
      inputId,
      show,
      close,
      resetFields,
      resetUploadState,
      setObject,
      send,
      onChange,
      postNewFile,
      schema: props.schema,
    }
  },
}
</script>
