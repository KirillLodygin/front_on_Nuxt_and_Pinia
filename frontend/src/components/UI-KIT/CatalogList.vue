<template>
  <ul class="folder-list">
    <li
      v-for="folder in filteredFolders"
      :key="folder.id"
      class="folder"
      :class="{
        open: isOpen(folder.id),
        close: !isOpen(folder.id),
      }"
    >
      <div
        class="folder-main"
        :class="{
          active: activeFolder.id === folder.id,
          'drag-over': dragOverFolderId === folder.id
        }"
        draggable="true"
        @dragstart.stop="onDragStart($event, folder)"
        @dragover.prevent="onDragOver($event, folder)"
        @dragleave="onDragLeave($event, folder)"
        @drop.stop="onDrop($event, folder)"
        @click="handleFolderClick(folder)"
        @contextmenu="onRowCtx($event, folder)"
      >
        <i
          v-if="folder.children"
          class="icon icon-directory"
          :class="folderIconClass(folder.id)"
          @click.stop="toggle(folder.id)"
        />
        <span v-else class="icon-file"></span>
        <i class="icon fi_folder" />
        {{ folder.name }}
      </div>

      <CatalogList
        v-show="isOpen(folder.id)"
        v-if="folder.children && folder.children.length"
        :folders="folder.children"
        :propActiveFolder="activeFolder"
        @folderSelected="handleFolderClick"
        @onOpenFeature="openFeature"
        @onDeleteFolder="deleteFolder"
        @drop="emitDrop"
      />
    </li>
    <ks-dropdown ref="rowCtxMenu" :target="'_folder-list'" drop-pos="pointer" mouseButton="manually">
      <a class="dropdown-item" href="#" @click.prevent="openFeature(activeFolder)" v-if="activeFolder.children">
        <i class="icon fi_edit-3 fa-fw me-1"></i> Свойства
      </a>
      <a class="dropdown-item" href="#" @click.prevent="deleteFolder(activeFolder)">
        <i class="icon fi_trash fa-fw me-1"></i> Удалить
      </a>
    </ks-dropdown>
  </ul>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import CatalogList from '~/components/UI-KIT/CatalogList.vue'
import KsDropdown from '~/components/MapComponent/KsDropdown.vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  folders: { type: Array, required: true },
  searchValue: String,
  propActiveFolder: Object,
})

const emits = defineEmits(['folderSelected', 'onOpenFeature', 'onDeleteFolder', 'drop'])

const openState = ref<Record<number, boolean>>(loadOpenState())
const activeFolder = ref<any>(props.propActiveFolder || {})
const rowCtxMenu = ref<any>(null)
const dragOverFolderId = ref<number | null>(null)

const route = useRoute()

function saveOpenState() {
  localStorage.setItem('openState', JSON.stringify(openState.value))
}

function loadOpenState() {
  const state = localStorage.getItem('openState')
  return state ? JSON.parse(state) : {}
}

function initializeOpenState(folder: any) {
  if (openState.value[folder.id] === undefined) openState.value[folder.id] = false
  folder.children?.forEach(initializeOpenState)
}

function applyOpenState(folder: any) {
  folder.isOpen = !!openState.value[folder.id]
  folder.children?.forEach(applyOpenState)
}

const isOpen = (id: number) => openState.value[id]

const toggle = (id: number) => {
  openState.value[id] = !openState.value[id]
  saveOpenState()
}

const handleFolderClick = (folder: any) => {
  toggle(folder.id)
  if (activeFolder.value.id !== folder.id && rowCtxMenu.value) {
    rowCtxMenu.value.hide()
  }
  activeFolder.value = folder
  emits('folderSelected', folder)
}

const onRowCtx = (event: Event, folder: any) => {
  if (activeFolder.value.id === folder.id && rowCtxMenu.value) rowCtxMenu.value.show(event)
}

const openFeature = (folder: object) => {
  emits('onOpenFeature', folder)
  rowCtxMenu.value?.hide()
}

const deleteFolder = (folder: object) => {
  emits('onDeleteFolder', folder)
  rowCtxMenu.value?.hide()
}

const filteredFolders = computed(() => {
  if (!props.searchValue) return props.folders

  const searchValue = props.searchValue.toLowerCase()
  const filterFolders = (folders: any[]) =>
    folders.reduce((acc: any[], folder: any) => {
      const matches = folder.name?.toLowerCase().includes(searchValue)
      const filteredChildren = folder.children ? filterFolders(folder.children) : []
      if (matches || filteredChildren.length) acc.push({ ...folder, children: filteredChildren })
      return acc
    }, [])

  return filterFolders(props.folders)
})

const folderIconClass = (id: number) =>
  isOpen(id) ? 'fi_chevron-down' : 'fi_chevron-right'

watch(
  () => props.propActiveFolder,
  (newValue) => {
    activeFolder.value = newValue
    if (newValue?.id) openActiveFolderPath(newValue)
  },
)

watch(
  () => route.hash,
  (newHash) => {
    if (['#Привязка карточек к каталогу', '#Привязка объектов к каталогу'].includes(newHash)) {
      if (activeFolder.value?.id) openActiveFolderPath(activeFolder.value)
    }
  },
  { immediate: true },
)

onMounted(() => {
  props.folders.forEach(initializeOpenState)
  props.folders.forEach(applyOpenState)
  saveOpenState()
})

function openActiveFolderPath(folder: any) {
  let currentFolder = folder
  while (currentFolder?.id) {
    openState.value[currentFolder.id] = true
    currentFolder = findParentFolder(currentFolder, props.folders)
  }
  saveOpenState()
}

function findParentFolder(folder: any, folders: any): any {
  for (const parent of folders) {
    if (parent.children?.some((child: any) => child.id === folder.id)) return parent
    const found = parent.children ? findParentFolder(folder, parent.children) : null
    if (found) return found
  }
  return null
}

const emitDrop = (value: any) => emits('drop', value)

const onDragStart = (event: DragEvent, folder: any) => {
  event.dataTransfer?.setData('text/plain', JSON.stringify(folder))
}

const onDragOver = (event: DragEvent, folder: any) => {
  event.preventDefault()
  dragOverFolderId.value = folder.id
}

const onDragLeave = (event: DragEvent, folder: any) => {
  dragOverFolderId.value = null
}

const onDrop = (event: DragEvent, targetFolder: any) => {
  event.preventDefault()
  dragOverFolderId.value = null
  const draggedData = event.dataTransfer?.getData('text/plain')
  if (draggedData) {
    const draggedFolder = JSON.parse(draggedData)
    emits('drop', { draggedFolder, targetFolder })
  }
}
</script>

<style lang="scss" scoped>
.folder-list {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
}

.folder {
  position: relative;
  list-style-type: none;

  &-main {
    display: flex;
    gap: 0.5rem;
    padding: 0.25rem 0.375rem;
    font-size: 0.875rem;
    font-weight: 400;
    margin-bottom: 0.25rem;
    align-items: center;
    cursor: pointer;

    &.active {
      background-color: #e7e9ea;
      font-weight: 600;
    }

    &.drag-over {
      border: 2px dashed #007acc;
      border-radius: 4px;
      background-color: rgba(0, 122, 204, 0.1);
      .icon.fi_folder {
        color: #007acc;
        transform: rotate(-15deg);
        transition: transform 0.2s ease, color 0.2s ease;
      }
    }

    .icon-file {
      width: 1.25rem;
      display: flex;
      justify-content: center;
      align-items: center;
      &::before {
        content: '\25A0';
        display: inline-block;
        font-size: 0.5rem;
        color: black;
      }
    }
  }

  .icon {
    width: 1.25rem;
    min-width: 1.25rem;
    height: 1.25rem;
  }
}
</style>
