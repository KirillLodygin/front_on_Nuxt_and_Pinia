<template>
  <div ref="scrollBox" class="tab_files" @dragenter="stopScroll()">
    <div class="tab_files_header card-toolbar">
      <BNavItemDropdown
        v-if="mode === photo"
        v-model="uploadMenuShow"
        :disabled="disabledModifier"
        :menu-class="['nav-item-dropdown-files_menu shadow', { 'd-block': uploadMenuShow }]"
        class="nav-item-dropdown-files"
        no-caret
        right
      >
        <!-- Using 'button-content' slot -->
        <template #button-content>
          <button :disabled="disabledModifier" class="nav-item-dropdown-files_header btn bth-tool">
            <i class="icon form_upload me-1" /> Загрузить <i class="icon fi_chevron-down ms-1" />
          </button>
        </template>
        <BDropdownItem v-for="group in gropusNamesOptions" @click="openFileUploadSystemMenu(group.value)">
          <div><i class="nav-item-dropdown-files_menu_icon icon form_folder" />{{ group.display_name }}</div>
        </BDropdownItem>
      </BNavItemDropdown>
      <button
        v-else
        :disabled="disabledModifier"
        class="nav-item-dropdown-files_header btn bth-tool"
        @click="openFileUploadSystemMenu(documents)"
      >
        <i class="icon form_upload me-1" /> Загрузить
      </button>
      <!-- предположительно, аттрибут accept работает некорректно с реактивностью вью,
        поэтому такой костыль в виде двух инпутов.
        в идеале выносить типы в константы и задавать accept динамически-->
      <input
        :id="'fileInput_photo_' + mode"
        type="file"
        class="disabled-file-upload d-none"
        multiple
        placeholder="Файл"
        plain
        :accept="'.jpeg, .jpg, .png, .webp, .svg'"
        @click="
          (e: MouseEvent) => {
            ;(e.currentTarget! as HTMLInputElement).value = ''
          }
        "
        @change="onFileInputChanged"
      />
      <input
        :id="'fileInput_documents_' + mode"
        type="file"
        class="disabled-file-upload d-none"
        multiple
        placeholder="Файл"
        plain
        @click="
          (e: MouseEvent) => {
            ;(e.currentTarget! as HTMLInputElement).value = ''
          }
        "
        @change="onFileInputChanged"
      />
      <template v-if="allSelectedCount">
        <div class="tab_files_header_menu gap-2">
          <div class="tab_files_header_menu_text">Выделено файлов: {{ allSelectedCount }}</div>
          <button
            :disabled="disabledModifier"
            class="tab_files_header_menu_button btn bth-tool"
            @click="deleteSelected()"
          >
            <i class="tab_files_header_menu_button_icon icon fi_trash" />
            Удалить
          </button>
          <button
            v-if="!isNew"
            :disabled="disabledModifier"
            class="tab_files_header_menu_button btn bth-tool"
            @click="downloadSelected()"
          >
            <i class="tab_files_header_menu_button_icon icon form_upload" />
            Скачать
          </button>
          <BNavItemDropdown
            v-if="mode === photo"
            v-model="fileMoveMenuShow"
            :disabled="disabledModifier"
            :menu-class="['nav-item-dropdown-files_menu shadow', { 'd-block': fileMoveMenuShow }]"
            class="nav-item-dropdown-files tab_files_header_menu_button"
            no-caret
            right
          >
            <!-- Using 'button-content' slot -->
            <template #button-content>
              <button
                :disabled="disabledModifier"
                class="tab_files_header_menu_button tab_files_header_menu_button_nav-item-dropdown-files_header btn bth-tool"
              >
                <i class="icon fi_log-in me-1" />Переместить<i class="icon fi_chevron-down" />
              </button>
            </template>
            <BDropdownItem
              v-for="group in gropusNamesOptions"
              :menu-class="'test2'"
              @click="updateFileDescriptionSelected(group.value)"
            >
              <div><i class="nav-item-dropdown-files_menu_icon icon form_folder" />{{ group.display_name }}</div>
            </BDropdownItem>
          </BNavItemDropdown>
        </div>
      </template>
      <template v-else-if="showDragAlert">
        <div class="tab_files_header_menu gap-2">
          <i class="icon fi_alert-circle" />
          Также файлы можно загрузить, перетащив их в нужную категорию
          <i class="icon fi_x" type="button" @click="showDragAlert = false" />
        </div>
      </template>
      <div v-if="mode === photo" aria-label="Простой пример" class="btn-group ms-auto" role="group">
        <button :class="['btn bth-tool', { active: isTable }]" type="button" @click="isTable = true">Таблица</button>
        <button :class="['btn bth-tool', { active: !isTable }]" type="button" @click="isTable = false">Эскизы</button>
      </div>
    </div>

    <div class="tab_files_body" :class="isTable ? 'overflow-y-hidden' : ''">
      <BTableSimple
        v-if="isTable"
        :table-class="'geo-layer-table-content files-table'"
        style="max-height: 100%"
        responsive
        sticky-header
      >
        <BThead head-variant="dark">
          <BTr>
            <BTh v-for="header in tableHeader" :key="header.key" class="col-auto citooltip">
              <div
                :class="['d-flex sortable-column-header', { 'sorted-column': isSorted && sortField === header.key }]"
                role="button"
                @click.prevent="setSortDirection(sortDirection, header.key)"
              >
                <span class="flex-fill">
                  {{ header.label }}
                </span>
                <i
                  :class="[
                    isSorted && sortField === header.key
                      ? `icon fi_sort-${sortDirection === 'asc' ? 'up' : 'down'}`
                      : 'icon fi_sort-up-down',
                    'ms-1 align-self-center',
                  ]"
                ></i>
              </div>
            </BTh>
            <BTh></BTh>
          </BTr>
        </BThead>
        <BTbody
          v-for="(value, index) in groupedFiles"
          :key="index"
          :class="[
            toggledGroups[index].dragEntered ? 'files-group__dragenter' : '',
            !value.length &&
            toggledGroups[index].dragEntered &&
            index !== 'Другое' &&
            index !== 'Снимок экрана по умолчанию'
              ? 'files-group__dragenter__empty'
              : '',
          ]"
          class="files-group"
          @dragleave="() => dragLeave(index.toString())"
          @drop.prevent="(e: DragEvent) => drop(e, index.toString())"
          @dragenter.prevent="(e: DragEvent) => dragEnter(e, index.toString())"
          @dragover.prevent
        >
          <template v-if="index !== 'Другое' && index !== 'Снимок экрана по умолчанию'">
            <div
              v-if="toggledGroups[index].dragEntered && index !== 'Другое' && index !== 'Снимок экрана по умолчанию'"
              class="files-group_drag-info"
            >
              <div class="files-group_drag-info_content">
                <i class="icon form_upload white" />{{ 'Перемещаемые файлы будут добавлены в категорию ' + index }}
              </div>
            </div>

            <BTd
              v-if="mode === photo"
              id="files-table_section-header"
              :class="
                requiredFilesAccessor.includes(index) && !groupedFiles[index].length && !mutableData.ads_screenshot
                  ? 'text-danger'
                  : ''
              "
              class="tab_files_body_section_title"
              @click="toggleGroup(index as string)"
            >
              <i
                id="tab_files_body_title_icon"
                :class="!toggledGroups[index].toggled ? ' icon fi_chevron-right' : ' icon fi_chevron-down'"
              />
              {{ index + ' (' + value.length + ')'
              }}<i
                v-if="requiredFilesAccessor.includes(index) && !mutableData.ads_screenshot"
                class="icon form_required-star map-object-properties_body_input_required-star"
              />
            </BTd>

            <UploadedFileTable
              v-for="file in value"
              :key="file.file.pk"
              :class="toggledGroups[index].toggled ? '' : 'd-none'"
              :delete-file="fileDelete"
              :file="file.file"
              :groups-names="groupsNames"
              :is-image="isImage(file.file.name)"
              :is-new="isNew"
              :is-selected="file.selected"
              :open-handler="openFile"
              :select-file="selectFile"
              :select-exact-file="selectExactFile"
              :select-file-shift="selectFileShift"
              :set-ads-screenshot="setAdsScreenshot"
              :set-moved-file="setMovedFile"
              :update-file-description="updateFileDescription"
              :update-file-name="updateFileName"
              :label="file.file.label"
              :disabled-modifier="disabledModifier"
              class="uploaded-field_body_files_file"
            />
            <!-- </div> -->
          </template>
        </BTbody>
      </BTableSimple>
      <div
        v-for="(value, index) in groupedFiles"
        v-else
        :key="index"
        :class="[
          toggledGroups[index].dragEntered ? 'files-group__dragenter' : '',
          !value.length &&
          toggledGroups[index].dragEntered &&
          index !== 'Другое' &&
          index !== 'Снимок экрана по умолчанию'
            ? 'files-group__dragenter__empty'
            : '',
        ]"
        class="files-group"
        @dragleave="() => dragLeave(index.toString())"
        @drop.prevent="(e: DragEvent) => drop(e, index.toString())"
        @dragenter.prevent="(e: DragEvent) => dragEnter(e, index.toString())"
        @dragover.prevent
      >
        <div
          v-if="toggledGroups[index].dragEntered && index !== 'Другое' && index !== 'Снимок экрана по умолчанию'"
          class="files-group_drag-info"
        >
          <div class="files-group_drag-info_content">
            <i class="icon form_upload white" />{{ 'Перемещаемые файлы будут добавлены в категорию ' + index }}
          </div>
        </div>
        <div
          :class="
            requiredFilesAccessor.includes(index) && !groupedFiles[index].length && !mutableData.ads_screenshot
              ? 'text-danger'
              : ''
          "
          class="tab_files_body_section_title"
          @click="toggleGroup(index as string)"
        >
          <i
            id="tab_files_body_title_icon"
            :class="!toggledGroups[index].toggled ? ' icon fi_chevron-right' : ' icon fi_chevron-down'"
          />
          {{ index + ' (' + value.length + ')' }}
          <i
            v-if="requiredFilesAccessor.includes(index) && !mutableData.ads_screenshot"
            class="icon form_required-star map-object-properties_body_input_required-star"
          />
        </div>
        <div :class="toggledGroups[index].toggled ? '' : 'd-none'" class="tab_files_body_section_files">
          <Gallery v-model="isGalleryOpen" :imgSrcList="images" :index="selectedImage!"></Gallery>

          <UploadedFileThumbnail
            v-for="file in value"
            :key="file.file.pk"
            :delete-file="fileDelete"
            :file="file.file"
            :groups-names="groupsNames"
            :is-image="
              isImage(file.file.name) ||
              file.file.description === 'Другое' ||
              file.file.description === 'Снимок экрана по умолчанию'
            "
            :is-new="isNew"
            :is-selected="file.selected"
            :open-handler="openFile"
            :select-file="selectFile"
            :select-exact-file="selectExactFile"
            :select-file-shift="selectFileShift"
            :set-ads-screenshot="setAdsScreenshot"
            :set-moved-file="setMovedFile"
            :update-file-description="updateFileDescription"
            :update-file-name="updateFileName"
            :label="file.file.label"
            :disabled-modifier="disabledModifier"
            class="uploaded-field_body_files_file"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import mime from 'mime'
import _ from 'lodash'

import {
  filesGroupCard,
  pathToImagesLink,
  screenShots,
  photosArr,
  filesArr,
  filesExtByMode,
  documentsGroup,
} from '~/app_constants/filesGroup'
import { photo, documents } from '~/app_constants/mapObjectConsts'
import Gallery from '../../UI-KIT/Gallery.vue'
import UploadedFileThumbnail from '../UploadedFileThumbnail.vue'
import UploadedFileTable from '../UploadedFileTable.vue'
import { BFormFile } from 'bootstrap-vue-next'
import {
  type FileForComponentType,
  type FileGroup,
  type FileType,
  type fileUpdateParamsType,
  type groupedFilesType,
  type objectTypeCalcType,
  type objectTypeType,
} from '~/types/mapObjectPropertiesTypes'

interface Props {
  mutableData: Record<string, any>
  isNew: boolean
  mode: typeof photo | typeof documents
  apiUrl: string
  filesGroupDataProp: FileGroup
  objectTypeCalc: objectTypeCalcType
  objectType: objectTypeType
  disabledModifier: boolean
  requiredFilesAccessor: any
  isCard: boolean
}

const { $objectStore, $baseURL } = useNuxtApp()
const props = defineProps<Props>()
const emit = defineEmits(['fileUploaded'])
const scrollInterval: Ref<number | ReturnType<typeof setInterval> | null> = ref(null)
const scrollBox: Ref<HTMLDivElement | null> = ref(null)
const uploadMenuShow = ref(false)
const fileMoveMenuShow = ref(false)
const showDragAlert = ref(true)
const filterArrByMode = props.mode === photo ? photosArr : filesArr
const filesExtArrByMode = filesExtByMode[props.mode]

// Methods

function stopScroll() {
  if (scrollInterval.value) {
    clearInterval(scrollInterval.value)
  }
}

const root: Ref<string> = ref('Общее')
const selectedFilesGroup: Ref<string> = ref(root.value)

const movedFile: FileType = reactive({
  pk: 0,
  label: '',
  url: '',
  original_filename: '',
  name: '',
  description: '',
  uploaded_at: '',
  _file_size: 0,
})
const groupsNames: Array<string> = reactive([])
const filesGroup: Ref<FileGroup> = ref(props.filesGroupDataProp)
const groupedFiles: groupedFilesType = reactive({})
const groupedFilesNotSorted: groupedFilesType = reactive({})
const filesCopy: Array<FileForComponentType> = reactive([])
const isMoveDropdownContentDisplay: { [key: string]: boolean } = reactive({})
const screenshotFile: FileType = reactive({
  pk: 0,
  label: '',
  url: '',
  original_filename: '',
  name: '',
  description: '',
  uploaded_at: '',
  _file_size: 0,
})
const countOfSelected: { [key: string]: number } = reactive({})
const currentFiles: Ref<File[]> = ref([])
const isFilesGroupInput: Ref<boolean> = ref(false)
const selectedImage = ref<number | null>(null)
const isGalleryOpen = ref<boolean>(false)
const images = computed(() => {
  const imgs: Array<{ title: string; url: string }> = []
  filesCopy.forEach((file) => {
    if (
      isImage(file.file.name) ||
      file.file.description === 'Другое' ||
      file.file.description === 'Снимок экрана по умолчанию'
    ) {
      imgs.push({
        title: file.file.name,
        url: $baseURL + file.file.url,
      })
    }
  })
  if (groupedFiles['Другое']) {
    groupedFiles['Другое'].forEach((file) => {
      imgs.push({
        title: file.file.name,
        url: file.file.url.includes('http') ? file.file.url : $baseURL + pathToImagesLink + file.file.url,
      })
    })
  }
  if (groupedFiles['Снимок экрана по умолчанию']) {
    groupedFiles['Снимок экрана по умолчанию'].forEach((file) => {
      imgs.push({
        title: file.file.name,
        url: file.file.url.includes('http') ? file.file.url : $baseURL + pathToImagesLink + file.file.url,
      })
    })
  }
  console.log(imgs)
  return imgs
})

const gropusNamesOptions = computed(() => {
  return groupsNames
    .map((item) => {
      return {
        display_name: item,
        value: item,
      }
    })
    .filter((item) => item.display_name !== 'Другое' && item.display_name !== 'Снимок экрана по умолчанию')
})

const currentKey: Ref<number> = ref(0)
const allSelectedCount = computed(() => {
  let count = 0

  for (const key in countOfSelected) {
    count = count + countOfSelected[key]
  }
  return count
})

watch(
  () => props.mutableData.files,
  async (newVal: Array<FileType>) => {
    console.log('wathcer files')
    const filtredFiles = filterFilesByMode(newVal)
    groupsNames.forEach((groupName) => {
      groupedFiles[groupName] = []
    })

    const newFilesCopy = newVal.map((file): FileForComponentType => {
      return { file, selected: false }
    })
    Object.assign(filesCopy, newFilesCopy)

    createGroupedFiles(filtredFiles)
    createImagesLinks()
    createScreenshot()

    Object.assign(movedFile, {})

    Object.assign(countOfSelected, getNumberOfSelected())
  },
  { deep: true },
)

watch(
  () => currentFiles.value,
  (newVal) => {
    if (newVal.length) {
      if (props.isNew) {
        fileUploadIsNew()
      } else {
        fileUpload()
      }
    }
  },
)

function createGroupedFiles(newVal: Array<FileType>) {
  groupsNames.forEach((groupName) => {
    groupedFiles[groupName] = []
    isMoveDropdownContentDisplay[groupName] = false
  })

  newVal.forEach((file) => {
    if (file.description === 'Снимки экрана:scr') {
      Object.assign(screenshotFile, file)
    }
    const groupName = file.description?.split(':')[0] || root.value
    if (groupedFiles[groupName]) {
      groupedFiles[groupName].push({ file, selected: false })
    } else {
      groupedFiles[groupName] = [{ file, selected: false }]
      groupsNames.push(groupName)
    }
  })
  console.log(groupedFiles, groupsNames)
  Object.assign(groupedFilesNotSorted, groupedFiles)
  if (isTable.value) sortFiles()
}

function getNumberOfSelected(): { [key: string]: number } {
  var counts: { [key: string]: number } = {}
  for (const [key, value] of Object.entries(groupedFiles)) {
    let count = 0
    value.forEach((file) => {
      if (file.selected) {
        count = count + 1
      }
    })
    counts[key] = count
  }
  return counts
}

function splitLastOccurrence(str: string, substring: string) {
  const lastIndex = str.lastIndexOf(substring)

  const before = str.slice(0, lastIndex)

  const after = str.slice(lastIndex + 1)

  return [before, after]
}
async function fileUpload() {
  console.log('fileUpload')
  if (!currentFiles.value.length) return
  const formdata = new FormData()
  for (const file of currentFiles.value) {
    const name = splitLastOccurrence(file.name, '.')
    name[0] = name[0].slice(0, 255 - name[1].length - 1)
    const newFile = new File([file], name.join('.'), {
      type: file.type,
    })
    formdata.append('files', newFile)
  }
  if (selectedFilesGroup.value) {
    formdata.append('description', selectedFilesGroup.value)
  }
  for (var pair of formdata.entries()) {
    console.log(pair[0], ', ', pair[1])
  }
  const resp = await $http
    .post(props.apiUrl + props.mutableData.pk + '/upload_file/', {
      body: formdata,
    })
    .then((res: Record<string, any>) => res._data)
    .catch((error: any) => {
      console.log(error)
    })

  props.mutableData.files = resp.files
  currentFiles.value = []
  if (props.isCard) {
    $objectStore.checkBySection(props.mode, props.mode, props.mutableData, '')

    await $objectStore.updateIsCheckedByFiles()
  }
}

async function fileDelete(id: number) {
  if (props.isNew) {
    for (const key in groupedFiles) {
      groupedFiles[key] = groupedFiles[key].filter((file) => file.file.pk !== id)
    }
    return
  }
  const resp = await $http
    .delete(`${props.apiUrl + props.mutableData.pk}/delete_file/?file_id=${id}`)
    .then((res: Record<string, any>) => res._data)
  Object.assign(
    filesCopy,
    filesCopy.filter((file) => file.file.pk !== id),
  )
  Object.assign(countOfSelected, getNumberOfSelected())
  props.mutableData.files = resp.files
  if (props.isCard) {
    $objectStore.checkBySection(props.mode, props.mode, props.mutableData, '')

    await $objectStore.updateIsCheckedByFiles()
  }
}

function selectFile(fileSelect: FileType) {
  if (fileSelect.description === 'Другое' || fileSelect.description === 'Снимок экрана по умолчанию') {
    return
  }

  setIsSelected(fileSelect)

  shiftSelection.main = _.cloneDeep(fileSelect)
  Object.assign(countOfSelected, getNumberOfSelected())
}

function selectExactFile(fileSelect: FileType) {
  if (fileSelect.description === 'Другое' || fileSelect.description === 'Снимок экрана по умолчанию') {
    return
  }
  for (const [key, value] of Object.entries(groupedFiles)) {
    value.forEach((file) => {
      file.selected = false
    })
  }
  setIsSelected(fileSelect)

  shiftSelection.main = _.cloneDeep(fileSelect)
  Object.assign(countOfSelected, getNumberOfSelected())
}

const shiftSelection: {
  main: FileType | null
  secondary: FileType | null
} = reactive({
  main: null,
  secondary: null,
})

function selectFileShift(fileSelect: FileType) {
  if (fileSelect.description === 'Другое' || fileSelect.description === 'Снимок экрана по умолчанию') {
    return
  }
  if (!shiftSelection.main) {
    shiftSelection.main = _.cloneDeep(fileSelect)
    setIsSelected(fileSelect)
  } else {
    shiftSelection.secondary = _.cloneDeep(fileSelect)
    resetSelected()
    const allFilesByDisplayOrder: FileForComponentType[] = []
    groupsNames.forEach((group) => {
      groupedFiles[group].forEach((file) => allFilesByDisplayOrder.push(file))
    })
    const mainIndex = findIndexOfFileInFileArray(allFilesByDisplayOrder, shiftSelection.main)
    const secondaryIndex = findIndexOfFileInFileArray(allFilesByDisplayOrder, shiftSelection.secondary)

    if (mainIndex > secondaryIndex) {
      setFileIsSelectedInArraySlice(allFilesByDisplayOrder, secondaryIndex, mainIndex)
    } else {
      setFileIsSelectedInArraySlice(allFilesByDisplayOrder, mainIndex, secondaryIndex)
    }
  }
  if (window.getSelection) {
    window?.getSelection()?.removeAllRanges()
  }
  Object.assign(countOfSelected, getNumberOfSelected())
}

function findIndexOfFileInFileArray(array: FileForComponentType[], file: FileType) {
  let index = -1
  for (let i = 0; i < array.length; i++) {
    if (_.isEqual(array[i].file, file)) {
      index = i
      break
    }
  }
  return index
}

function setIsSelected(fileSelect: FileType) {
  for (let i = 0; i < filesCopy.length; i++) {
    if (_.isEqual(fileSelect, filesCopy[i].file)) {
      filesCopy[i].selected = !filesCopy[i].selected
    }
  }
  for (var key in groupedFiles) {
    for (let i = 0; i < groupedFiles[key].length; i++) {
      if (_.isEqual(fileSelect, groupedFiles[key][i].file)) {
        groupedFiles[key][i].selected = !groupedFiles[key][i].selected
      }
    }
  }
}

function setFileIsSelectedInArraySlice(array: FileForComponentType[], startIndex: number, endIndex: number) {
  for (let i = startIndex; i < endIndex + 1; i++) {
    array[i].selected = true
  }
  console.log('slice', groupedFiles, startIndex, endIndex)
}

function downloadSelected() {
  for (const keyObj in groupedFiles) {
    groupedFiles[keyObj].forEach((file) => {
      if (file.selected) {
        const a = document.createElement('a')

        a.href = $baseURL + file.file.url
        a.download = file.file.url.split('/').pop()!
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    })
  }
}

async function deleteSelected() {
  for (const keyObj in groupedFiles) {
    await Promise.all(
      groupedFiles[keyObj].map(async (file) => {
        if (file.selected) {
          await fileDelete(file.file.pk)
        }
      }),
    )
  }

  resetSelected()
  Object.assign(countOfSelected, getNumberOfSelected())
  if (props.isCard) {
    $objectStore.checkBySection(props.mode, props.mode, props.mutableData, '')
    await $objectStore.updateIsCheckedByFiles()
  }
}

function setMovedFile(file: FileType) {
  Object.assign(movedFile, file)
}

async function updateFileProps(params: fileUpdateParamsType) {
  return await $http
    .patch(`${props.apiUrl + props.mutableData.pk}/update_file/?file_id=${movedFile.pk}`, {
      body: params,
    })
    .then((res: Record<string, any>) => res._data)
}

async function setFileDescription(group: string) {
  const params = { description: group === root.value ? null : group }
  return await updateFileProps(params)
}

async function setFileName(name: string) {
  const params = { name }
  return await updateFileProps(params)
}

function updateFileName(file: FileType, label: string) {
  Object.assign(movedFile, file)
  if (props.isNew) {
    groupedFiles[movedFile.description].forEach((item, index) => {
      if (item.file.pk === movedFile.pk) {
        groupedFiles[movedFile.description][index].file.name = label
        groupedFiles[movedFile.description][index].file.original_filename = label
        groupedFiles[movedFile.description][index].file.label = label
        groupedFiles[movedFile.description][index].originalFile = new File(
          [groupedFiles[movedFile.description][index].originalFile!],
          label,
        )
      }
    })
    return
  }
  setFileName(label).then((res: Record<string, any>) => {
    props.mutableData.files = res.files
    Object.assign(movedFile, {})
    // movedFile = {}
  })
}

async function updateFileDescription(group: string) {
  if ((group === root.value ? null : group) === movedFile.description) {
    Object.assign(movedFile, {})
    return
  }
  if (props.isNew) {
    const file = groupedFiles[movedFile.description].filter((item) => movedFile.pk === item.file.pk)[0]
    file.file.description = group

    groupedFiles[group].push(file)
    groupedFiles[movedFile.description] = groupedFiles[movedFile.description].filter(
      (item) => movedFile.pk !== item.file.pk,
    )
    return
  }
  setFileDescription(group)
    .then((res: Record<string, any>) => {
      props.mutableData.files = res.files
      if (props.isCard) {
        $objectStore.checkBySection(props.mode, props.mode, props.mutableData, [])
      }
    })
    .catch((error: any) => {
      console.log(error)
    })

  if (props.isCard) {
    $objectStore.checkBySection(props.mode, props.mode, props.mutableData, '')
    await $objectStore.updateIsCheckedByFiles()
  }
}

async function updateFileDescriptionSelected(group: string) {
  const arr: FileForComponentType[] = []
  for (const keyObj in groupedFiles) {
    arr.push(...groupedFiles[keyObj].filter((item) => item.selected))
  }

  arr.forEach(async (item) => {
    Object.assign(movedFile, item.file)
    await setFileDescription(group)
      .then((res: Record<string, any>) => {
        Object.assign(countOfSelected, getNumberOfSelected())
        props.mutableData.files = res.files
        if (props.isCard) {
          $objectStore.checkBySection(props.mode, props.mode, props.mutableData, [])
        }
      })
      .catch((error: any) => {
        console.log(error)
      })
  })
  if (props.isCard) {
    $objectStore.checkBySection(props.mode, props.mode, props.mutableData, '')
    await $objectStore.updateIsCheckedByFiles()
  }
}

function isImage(name: string) {
  if (typeof mime.getType(name) === 'string') {
    return mime.getType(name)!.includes('image/')
  } else {
    return false
  }
}

function openFile(name: string, url: string, description: string) {
  if (isImage(name) || description === 'Другое' || description === 'Снимок экрана по умолчанию') {
    selectedImage.value = getImageIndex(url, description)
  }

  isGalleryOpen.value = !isGalleryOpen.value
}

function getImageIndex(url: string, description: string): number | null {
  let imgIndex: number | null = null
  images.value.forEach((image, index) => {
    const newUrl =
      description === 'Другое' || description === 'Снимок экрана по умолчанию'
        ? url.includes('http')
          ? url
          : $baseURL + pathToImagesLink + url
        : $baseURL + url
    if (image.url === newUrl) {
      imgIndex = index
    }
  })

  return imgIndex
}

function setAdsScreenshot(file: any) {
  console.log('setAdsScreenshot', file)
}

function filterFilesByMode(files: Array<FileType>) {
  const filtredGroupNames = filesGroup.value[props.objectTypeCalc || 'OA'][props.objectType].filter((group) =>
    filterArrByMode.includes(group),
  )

  Object.assign(groupsNames, filtredGroupNames)
  return files.filter((file) =>
    file.description === null
      ? groupsNames.includes(root.value) && (props.mode === photo ? isImage(file.name) : !isImage(file.name))
      : groupsNames.includes(file.description),
  )
}

function init(newVal: Array<FileType>) {
  const filtredFiles = filterFilesByMode(newVal)
  console.log(filtredFiles, 'newVal', filterArrByMode)
  groupsNames.forEach((groupName) => {
    groupedFiles[groupName] = []
  })

  const newFilesCopy = newVal.map((file): FileForComponentType => {
    return { file, selected: false }
  })
  Object.assign(filesCopy, newFilesCopy)

  createGroupedFiles(filtredFiles)
  createImagesLinks()
  createScreenshot()

  Object.assign(movedFile, {})
  Object.assign(countOfSelected, getNumberOfSelected())
  Object.assign(toggledGroups, initToggleGroups())
}

onMounted(() => {
  init(props.mutableData.files)
})

function openFileUploadSystemMenu(description: string) {
  selectedFilesGroup.value = description

  document.getElementById('fileInput_' + (props.mode == photo ? 'photo_' : 'documents_') + props.mode)?.click()
}

function test(e: any) {
  console.log(e, currentFiles.value)
}

function fileUploadIsNew() {
  const originalFilesToFilesForComponent: FileForComponentType[] = currentFiles.value.map((item) => {
    const fileObj: FileForComponentType = {
      file: {
        pk: currentKey.value,
        label: item.name,
        url: generateURL(item),
        name: item.name,
        original_filename: item.name,
        description: selectedFilesGroup.value,
        uploaded_at: '',
        _file_size: item.size,
      },
      selected: false,
      originalFile: item,
    }
    currentKey.value = currentKey.value + 1
    return fileObj
  })
  groupedFiles[selectedFilesGroup.value] = [
    ...groupedFiles[selectedFilesGroup.value],
    ...originalFilesToFilesForComponent,
  ]
  currentFiles.value = []
}

function generateURL(file: File) {
  const fileSrc = URL.createObjectURL(file)
  setTimeout(() => {
    URL.revokeObjectURL(fileSrc)
  }, 1000)
  return fileSrc
}

function resetSelected() {
  for (const key in groupedFiles) {
    groupedFiles[key].forEach((item, index) => {
      groupedFiles[key][index].selected = false
    })
  }
  Object.assign(countOfSelected, getNumberOfSelected())
}

// Раскрытие/скрытие групп файлов

const toggledGroups: {
  [key: string]: {
    toggled: boolean
    dragEntered: boolean
  }
} = reactive({})

function initToggleGroups() {
  var counts: {
    [key: string]: {
      toggled: boolean
      dragEntered: boolean
    }
  } = {}
  for (const [key, value] of Object.entries(groupedFiles)) {
    counts[key] = { toggled: props.mode !== photo ? true : false, dragEntered: false }
  }
  return counts
}

function toggleGroup(group: string) {
  toggledGroups[group].toggled = !toggledGroups[group].toggled
}

let countDrag = 0

function dragEnter(e: DragEvent, group: string) {
  if (props.disabledModifier) return
  if (!toggledGroups[group].toggled) {
    toggledGroups[group].toggled = !toggledGroups[group].toggled
  }
  if (!toggledGroups[group].dragEntered) {
    toggledGroups[group].dragEntered = true
  }

  countDrag++
  if (selectedFilesGroup.value !== group) {
    selectedFilesGroup.value = group
  }
}

function dragLeave(group: string) {
  if (props.disabledModifier) return
  countDrag--
  if (group === 'Другое' || group === 'Снимок экрана по умолчанию') return
  if (selectedFilesGroup.value !== group || countDrag === 0) {
    selectedFilesGroup.value = ''
    toggledGroups[group].dragEntered = false
  }
}

async function drop(ev: DragEvent, group: string) {
  if (props.disabledModifier) return
  console.log(ev.dataTransfer?.items, 'drop')
  countDrag = 0
  if (group === 'Другое' || group === 'Снимок экрана по умолчанию') return
  toggledGroups[group].dragEntered = false
  if (ev.dataTransfer?.items) {
    // Use DataTransferItemList interface to access the file(s)
    currentFiles.value = [...ev.dataTransfer.items]
      .filter(
        (item, i) =>
          // If dropped items aren't files, reject them
          item.kind === 'file',
      )
      .map((item) => item.getAsFile())
      .filter((item): item is File => item !== null)
      .filter((file) => {
        const splittedName = file.name.split('.')
        const ext = splittedName[splittedName.length - 1].toLowerCase()
        console.log(ext, filesExtArrByMode.includes(ext), filesExtArrByMode, props.mode)
        return filesExtArrByMode.includes(ext)
      })
  } else {
    currentFiles.value = [...ev.dataTransfer!.files].filter((file) => {
      const splittedName = file.name.split('.')
      const ext = splittedName[splittedName.length - 1].toLowerCase()
      console.log(ext, filesExtArrByMode.includes(ext), filesExtArrByMode, props.mode)
      return filesExtArrByMode.includes(ext)
    })
  }
  console.log('currentFiles', currentFiles.value)
}

// Таблица
const isTable: Ref<boolean> = ref(props.mode === photo ? false : true)
const sortDirection: Ref<string> = ref('none')
const sortField: Ref<keyof FileType> = ref('label')
const isSorted: Ref<boolean> = ref(false)
const tableHeader: {
  key: keyof FileType
  label: string
}[] = [
  {
    key: 'label',
    label: 'Название',
  },
  {
    key: 'uploaded_at',
    label: 'Загружен',
  },
  {
    key: '_file_size',
    label: 'Размер',
  },
]
const nextDirection: { [key: string]: string } = {
  none: 'asc',
  asc: 'desc',
  desc: 'none',
}

function setSortDirection(sortDirectionData: string, key: keyof FileType) {
  if (sortField.value !== key) {
    sortDirection.value = nextDirection['none']
  } else sortDirection.value = nextDirection[sortDirectionData]

  sortField.value = key
  if (sortDirection.value !== 'none') isSorted.value = true
  else {
    isSorted.value = false
    Object.assign(groupedFiles, groupedFilesNotSorted)
    return
  }

  sortFiles()
}

function sortFiles() {
  for (const key in groupedFiles) {
    groupedFiles[key].sort((a, b) => {
      if (sortField.value === 'label') {
        return sortDirection.value === 'asc'
          ? +a.file[sortField.value].localeCompare(b.file[sortField.value])
          : +b.file[sortField.value].localeCompare(a.file[sortField.value])
      } else if (sortField.value === 'uploaded_at') {
        const aDate = new Date(a.file.uploaded_at).getTime()
        const bDate = new Date(b.file.uploaded_at).getTime()

        return sortDirection.value === 'desc' ? aDate - bDate : bDate - aDate
      } else {
        return sortDirection.value === 'desc'
          ? a.file._file_size - b.file._file_size
          : b.file._file_size - a.file._file_size
      }
    })
  }
}

function createImagesLinks() {
  if (props.mutableData.images_links && props.mutableData.images_links.length) {
    let count = 0
    groupedFiles['Другое'] = props.mutableData.images_links.map((item: string): FileForComponentType => {
      count++
      return {
        file: {
          pk: count,
          label: '',
          url: item.replace('/mnt/gisweb/screenshots', ''),
          original_filename: '',
          name: '',
          description: 'Другое',
          uploaded_at: '',
          _file_size: 0,
        },
        selected: false,
      }
    })
  }
}

function createScreenshot() {
  if (props.mutableData.ads_screenshot) {
    let count = 0
    groupedFiles['Снимок экрана по умолчанию'] = [props.mutableData.ads_screenshot].map(
      (item: string): FileForComponentType => {
        count++
        return {
          file: {
            pk: count,
            label: '',
            url: item.replace('/mnt/gisweb/screenshots', ''),
            original_filename: '',
            name: '',
            description: 'Снимок экрана по умолчанию',
            uploaded_at: '',
            _file_size: 0,
          },
          selected: false,
        }
      },
    )
  }
}

function onFileInputChanged(event: Event) {
  const target = event.target as HTMLInputElement
  if (target && target.files) {
    currentFiles.value = [...target.files].filter((file) => {
      const splittedName = file.name.split('.')
      const ext = splittedName[splittedName.length - 1].toLowerCase()
      return filesExtArrByMode.includes(ext)
    })
  }
}
</script>

<style scoped></style>
