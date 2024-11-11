<template>
  <div
    :class="isSelected ? 'tab_files_body_section_files_file__selected' : ''"
    class="tab_files_body_section_files_file"
    @dragstart="setMovedFile(file)"
    @click.ctrl.exact="selectFile(file)"
    @click.shift.exact="selectFileShift(file)"
  >
    <div class="tab_files_body_section_files_file_header">
      <BModal
        v-model="isRename"
        :class="{ 'd-block': isRename }"
        centered
        size="md"
        title="ПЕРЕИМЕНОВАТЬ ФАЙЛ"
        @close="setRenameInput(false)"
        @ok="updateFileLabel"
      >
        <div class="file-rename_label">Название файла</div>
        <!-- Заменил span`ы на input-group, но переименование нужно доработать -->
        <div class="input-group mb-3">
          <input
            type="text"
            class="form-control form-control-lg map-object-properties_body_input"
            aria-label="Название файла"
            aria-describedby="file-rename"
            :maxlength="255 - computedFileExtention.length - 1"
            :value="computedFileName"
            @input="(event) => setFileName('name', event)"
          />
          <span class="input-group-text" id="file-rename">.{{ computedFileExtention }}</span>
        </div>
        <template #footer="{ ok, cancel }">
          <div class="d-flex justify-content-end">
            <button
              class="btn btn-md btn-outline-secondary"
              @click="
                () => {
                  cancel()
                }
              "
            >
              Отмена
            </button>
            <button class="btn btn-md btn-primary ms-2" @click="() => ok()">Сохранить</button>
          </div>
        </template>
      </BModal>

      <p
        @click.stop.exact="selectExactFile(file)"
        @click.ctrl.exact.stop="selectFile(file)"
        @click.shift.exact.stop="selectFileShift(file)"
      >
        {{ file.label }}
      </p>

      <BNavItemDropdown
        v-if="file.description !== 'Другое' && file.description !== 'Снимок экрана по умолчанию'"
        v-model="fileMenuShow"
        :menu-class="[
          'nav-item-dropdown-files_menu overflow-visible nav-item-dropdown-files_menu__last shadow',
          { 'd-block': fileMenuShow },
        ]"
        :class="['nav-item-dropdown-files', { 'd-none': disabledModifier }]"
        :disabled="disabledModifier"
        no-caret
        right
      >
        <template #button-content>
          <div class="tab_files_body_section_files_file_header_menu">
            <i class="tab_files_body_section_files_file_header_menu_icon icon fi_more-vertical" />
          </div>
        </template>
        <BDropdownItem @click="setRenameInput(true)">
          <div><i class="file_menu_icon icon fi_edit-3" />Переименовать</div>
        </BDropdownItem>
        <BDropdownItem @click="download(file.url)">
          <div><i class="file_menu_icon icon form_upload" />Скачать</div>
        </BDropdownItem>

        <BNavItemDropdown
          v-if="groupsNames.length > 1"
          v-model="moveMenuShow"
          :menu-class="[` nav-item-dropdown-files_menu shadow folders-class${file.pk}`, { 'd-block': moveMenuShow }]"
          :dropend="true"
          class="file_menu_option_container"
          no-caret
          @mouseenter="() => setVisible()"
          @mouseleave="() => setHidden()"
        >
          <template #button-content>
            <div class="file_menu_option">
              <i class="file_menu_icon icon fi_log-in" />Переместить<i class="icon fi_chevron-right ms-auto" />
            </div>
          </template>
          <BDropdownItem
            v-for="groupName in groupsNames.filter(
              (item) => item !== 'Другое' && item !== 'Снимок экрана по умолчанию',
            )"
            @click="
              () => {
                setMovedFile(file)
                updateFileDescription(groupName)
              }
            "
          >
            <div><i class="nav-item-dropdown-files_menu_icon icon form_folder" />{{ groupName }}</div>
          </BDropdownItem>
        </BNavItemDropdown>

        <BDropdownItem @click="setAdsScreenshot(file)">
          <div><i class="file_menu_icon icon fi_monitor" />Установить как снимок экрана</div>
        </BDropdownItem>
        <BDropdownDivider />
        <BDropdownItem @click="deleteFile(file.pk)">
          <div><i class="file_menu_icon icon fi_trash-2" />Удалить</div>
        </BDropdownItem>
      </BNavItemDropdown>
    </div>
    <div
      v-if="isImage"
      :style="imageCssProp"
      class="tab_files_body_section_files_file_image"
      @click.exact.stop="openHandler(file.name, file.url, file.description)"
    />
    <div v-else />
  </div>
</template>

<script lang="ts" setup>
import { pathToImagesLink } from '~/app_constants/filesGroup'
import { type FileType } from '~/types/mapObjectPropertiesTypes'

const fileMenuShow = ref(false)
const moveMenuShow = ref(false)

interface Props {
  file: FileType
  deleteFile: (id: number) => Promise<void>
  selectFile: (fileSelect: FileType) => void
  selectFileShift: (fileSelect: FileType) => void
  selectExactFile: (fileSelect: FileType) => void
  setAdsScreenshot: (file: any) => void
  isSelected: boolean
  isImage: boolean
  openHandler: (name: string, url: string, description: string) => void
  groupsNames: string[]
  setMovedFile: (file: FileType) => void
  updateFileDescription: (group: string) => void
  updateFileName: (file: FileType, label: string) => void
  isNew: boolean
  disabledModifier: boolean
}

const props = defineProps<Props>()
const { $baseURL } = useNuxtApp()
const isRename: Ref<boolean> = ref(false)
const isDropdownContentDisplay: Ref<boolean> = ref(false)
const isMoveDropdownContentDisplay: Ref<boolean> = ref(false)
const fileNameWithoutExt: Ref<string> = ref(props.file.label.slice(0, props.file.label.lastIndexOf('.')))
watch(
  () => props.file.label,
  (newVal) => {
    fileNameWithoutExt.value = props.file.label.slice(0, props.file.label.lastIndexOf('.'))
  },
)
const fileExtension: Ref<string> = ref(
  props.file.label.slice((Math.max(0, props.file.label.lastIndexOf('.')) || Infinity) + 1),
)
const newFileLabel: Ref<string[]> = ref(['', ''])
const dropdown_container: Ref<HTMLElement | null> = ref(null)
const move_dropdown_container: Ref<HTMLElement | null> = ref(null)

const computedFileName = computed(() => {
  return fileNameWithoutExt.value.length ? fileNameWithoutExt.value : '???'
})
const computedFileExtention = computed(() => {
  return fileExtension.value.length ? fileExtension.value : '???'
})

const imageCssProp: Ref<{ backgroundImage: string }> = ref({
  backgroundImage: `url(${
    props.isNew || props.file.url.includes('http')
      ? props.file.url
      : props.file.description === 'Другое' || props.file.description === 'Снимок экрана по умолчанию'
        ? $baseURL + pathToImagesLink + props.file.url
        : $baseURL + props.file.url
  })`,
})

function updateFileLabel() {
  props.updateFileName(props.file, newFileLabel.value.join('.'))
  setRenameInput(false)
}

function setRenameInput(bool: boolean) {
  if (bool) {
    newFileLabel.value = [fileNameWithoutExt.value, fileExtension.value]
  }
  isRename.value = bool
}

function setFileName(target: string, event: Event) {
  if (target === 'name') {
    const eventTarget = event.target as HTMLInputElement

    newFileLabel.value[0] = eventTarget.value
  }
  if (target === 'ext') {
    const eventTarget = event.target as HTMLElement
    newFileLabel.value[1] = eventTarget.innerText
  }
}

function download(url: string) {
  const a = document.createElement('a')
  a.href = $baseURL + url
  a.download = url.split('/').pop()!
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function toggleMenu() {
  isDropdownContentDisplay.value = !isDropdownContentDisplay.value
}

function toggleMoveMenu() {
  isMoveDropdownContentDisplay.value = !isMoveDropdownContentDisplay.value
}

function onWindowClick(event: Event) {
  const eventTarget = event.target as HTMLElement
  if (!dropdown_container.value?.contains(eventTarget)) {
    isDropdownContentDisplay.value = false
  }
  if (!move_dropdown_container.value?.contains(eventTarget)) {
    isMoveDropdownContentDisplay.value = false
  }
}

const setVisible = () => {
  moveMenuShow.value = true
  if (document.querySelector(`.folders-class${props.file.pk}`) as HTMLUListElement) {
    ;(document.querySelector(`.folders-class${props.file.pk}`) as HTMLUListElement).style.display = ''
  }
}
const setHidden = () => {
  moveMenuShow.value = false
  if (document.querySelector(`.folders-class${props.file.pk}`) as HTMLUListElement) {
    ;(document.querySelector(`.folders-class${props.file.pk}`) as HTMLUListElement).style.display = 'none'
  }
}
</script>
