import { api_upload_reference } from '~/app_constants/api'

const NEW_REPORTING_FORM_INPUT = {
  name: 'newReportingInputForm',
  title: 'Добавить таблицу',
  action: api_upload_reference,
  submit: 'Загрузить',
  errorFileAttention: 'Допущена ошибка!',
  errorFileText: 'Загружаемый файл должен иметь расширение .xlsx, .xlx, .zip',
  errorButtonText: 'Загрузить другой файл',
  success: 'Файл успешно загружен!',
}

export const newReportingFormInput = {
  name: NEW_REPORTING_FORM_INPUT.name,
  title: NEW_REPORTING_FORM_INPUT.title,
  action: NEW_REPORTING_FORM_INPUT.action,
  submit: NEW_REPORTING_FORM_INPUT.submit,
  errorFileAttention: NEW_REPORTING_FORM_INPUT.errorFileAttention,
  errorFileText: NEW_REPORTING_FORM_INPUT.errorFileText,
  errorButtonText: NEW_REPORTING_FORM_INPUT.errorButtonText,
  success: NEW_REPORTING_FORM_INPUT.success,
  inputs: {
    file_uploaded: {
      name: 'file_uploaded',
      label: 'Файл новой или изменённой таблицы с коэффициентами',
      mode: 'BFormFile',
      type: 'text',
      placeholder: 'Файл не выбран',
      style: 'opacity: 0; visibility: hidden; position: absolute;',
    },
  },
  values: {},
}
