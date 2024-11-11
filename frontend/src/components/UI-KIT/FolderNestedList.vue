<template>
  <ul class="folder-list">
    <li
      v-for="folder in filteredFolders"
      :key="folder.id"
      class="folder"
      :class="{ open: isOpen(folder.id), close: !isOpen(folder.id) }"
    >
      <div
        class="folder-main"
        :class="{ active: activeFolder.id === folder.id }"
        @click="handleFolderClick(folder)"
        @contextmenu="onRowCtx($event, folder)"
      >
        <i
          class="icon icon-directory"
          :class="{ 'fi_chevron-right': !isOpen(folder.id), 'fi_chevron-down': isOpen(folder.id) }"
          @click.stop="toggle(folder.id)"
          v-if="folder.children"
        />
        <span class="icon-file" v-else></span>
        <i class="icon fi_folder" />
        {{ folder.name }}
      </div>

      <FolderList
        v-show="isOpen(folder.id)"
        :folders="folder.children"
        :propActiveFolder="activeFolder"
        @folderSelected="handleFolderClick"
        @onOpenFeature="openFeature"
        @onDeleteFolder="deleteFolder"
        v-if="folder.children && folder.children.length"
      />
    </li>
    <ks-dropdown ref="rowCtxMenu" :target="'_body'" drop-pos="pointer" mouseButton="manually">
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
import { ref, computed, onMounted, watch } from 'vue'
import FolderList from '~/components/UI-KIT/FolderNestedList.vue'
import KsDropdown from '~/components/MapComponent/KsDropdown.vue'

const props = defineProps({
  folders: { type: Array, required: true },
  searchValue: String,
  propActiveFolder: Object,
})

const emits = defineEmits(['folderSelected', 'onOpenFeature', 'onDeleteFolder'])

const openState: any = ref({})
const activeFolder: any = ref({})
const rowCtxMenu: any = ref(null)

function initializeOpenState(folder: any) {
  // Инициализация стоит на false только если ключ еще не установлен
  if (openState.value[folder.id] === undefined) {
    openState.value[folder.id] = false
  }
  if (folder.children) {
    folder.children.forEach(initializeOpenState) // Рекурсивно обрабатывает вложенные папки
  }
}

// Проверка, открыта ли папка
const isOpen = (id: number) => {
  return openState.value[id]
}

// Переключение состояния папки (открыть/закрыть)
const toggle = (id: number) => {
  openState.value[id] = !openState.value[id]
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
  if (activeFolder.value.id !== folder.id) return
  if (rowCtxMenu.value) rowCtxMenu.value.show(event)
}

const openFeature = (folder: object) => {
  emits('onOpenFeature', folder)
  rowCtxMenu.value.hide()
}

const deleteFolder = (folder: object) => {
  emits('onDeleteFolder', folder)
  rowCtxMenu.value.hide()
}

const filteredFolders = computed(() => {
  if (!props.searchValue) {
    return props.folders
  }

  const searchValue = props.searchValue.toLowerCase()

  function filterFolders(folders: any) {
    return folders.reduce((acc: any, folder: any) => {
      const matches = folder.name.toLowerCase().includes(searchValue)
      let filteredChildren = []

      if (folder.children) {
        filteredChildren = filterFolders(folder.children)
      }

      // Если текущая папка соответствует условиям поиска или у неё есть дочерние элементы, которые соответствуют
      if (matches || filteredChildren.length > 0) {
        // Создаём новый объект, чтобы не изменять оригинальный
        acc.push({ ...folder, children: filteredChildren })
      }

      return acc
    }, [])
  }

  return filterFolders(props.folders)
})

watch(
  () => props.propActiveFolder,
  (newValue) => {
    activeFolder.value = newValue
  },
)

// Инициализация состояния при загрузке
onMounted(() => {
  props.folders.forEach(initializeOpenState)
})
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

    .icon-file {
      width: 1.25rem;
      display: flex;
      justify-content: center;
      align-items: center;
      &::before {
        content: '\25A0'; /* Unicode для квадрата */
        display: inline-block;
        font-size: 0.5rem;
        color: black; /* Цвет квадрата */
      }
    }
  }

  .icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}
</style>
