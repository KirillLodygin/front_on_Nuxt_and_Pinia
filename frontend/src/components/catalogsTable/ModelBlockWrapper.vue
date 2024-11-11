<template>
  <template v-if="$geoObject.linkExistingCardTable && $geoObject.linkExistingCardType">
    <LoadingCover v-if="$userStore.pageLoading" />

    <TableBlockWrapper
      v-else
      :navigate-string="navigateStringComputed"
      :page-header="pageHeaderComputed"
      :title-for-add-button="titleForAddButtonComputed"
    />
  </template>
  <template v-else-if="$geoObject.linkExistingObjectsTable">
    <LoadingCover v-if="$userStore.pageLoading" />
    <div v-else class="h-100">
      <ModelBlockWrapper
        :navigate-string="navigateString.real_estate"
        :page-header="pageHeader.real_estate"
        :title-for-add-button="titleForAddButton.real_estate"
      />
    </div>
  </template>
  <div class="table-wrapper page-card h-100" v-else>
    <h1 class="page-header h-auto">{{ props.pageHeader }}</h1>
    <div class="content-block">
      <div class="h-100">
        <div class="side-bar d-flex flex-column h-100" style="width: 295px">
          <div class="side-bar__header">
            <i class="icon fi_folders-tree" />
            <span>Дерево каталогов</span>
          </div>
          <div class="search">
            <Input
              class="form-control short-filter-input w-100"
              type="search"
              placeholder="Название объекта или ..."
              v-model="searchValue"
              :is-large="false"
              :on-blur-clear="false"
            />
          </div>
          <div class="wrapper-folder-list flex-grow-1 overflow-auto" id="_folder-list">
            <LoadingCover v-if="$catalogsTable.foldersLoading" />
            <CatalogList
              :folders="$catalogsTable.folders"
              :searchValue="searchValue"
              :propActiveFolder="activeItem"
              @folderSelected="folderSelected"
              @onOpenFeature="onOpenFeature"
              @onDeleteFolder="onDeleteFolder"
              @drop="handleDrop"
              style="padding-left: 0"
              v-else
            />
          </div>
        </div>
      </div>
      <ModelBlock
        :navigate-string="props.navigateString"
        :title-for-add-button="props.titleForAddButton"
        @folderSelected="folderSelected"
        @onDelete="onDeleteFolder"
        @onOpenFeatures="onOpenFeature"
      />
      <FiltersAdditionalParametersModal
        class="filters-additional-parameters-modal"
        v-if="isShowFiltersAdditionalParameters"
      />
      <ModalFeaturesCatalog
        class="modal-features-catalog"
        :dataFolder="dataFolder"
        v-model="showModalFeatures"
        :users="$catalogsTable.usersArr"
        @acceptParameters="acceptParameters"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import Input from '~/components/UI-KIT/Inputs/Input.vue'
import ModelBlock from './ModelBlock.vue'
import FiltersAdditionalParametersModal from '../UI-KIT/Modals/FiltersAdditionalParametersModal.vue'
import { useNuxtApp } from 'nuxt/app'
import CatalogList from '~/components/UI-KIT/CatalogList.vue'
import ModalFeaturesCatalog from './ModalFeaturesCatalog.vue'
import { useRoute } from 'vue-router'
import TableBlockWrapper from '../ObjectsTable/TableBlockWrapper.vue'
import { navigateString, pageHeader, titleForAddButton } from '~/app_constants/objectsTable'
import ModelBlockWrapper from '../ObjectModelTable/ModelBlockWrapper.vue'
import LoadingCover from '~/components/UI-KIT/Loaders/LoadingCover.vue'

const route = useRoute()

const props = defineProps({
  pageHeader: { type: String, required: true },
  titleForAddButton: { type: String, required: true },
  navigateString: { type: String, required: true },
})

const { $catalogsTable, $geoObject, $userStore }: any = useNuxtApp()

const searchValue: any = ref('')
const showModalFeatures: any = ref(false)
const dataFolder: any = ref({})
const activeItem: any = ref(null)

const navigateStringByCalcTypeMap: any = {
  OO: 'aim',
  OA: 'analogs',
  NE: 'research',
}

const navigateStringComputed: any = computed(
  () => navigateString[navigateStringByCalcTypeMap[$geoObject.linkExistingCardType]],
)
const pageHeaderComputed: any = computed(() => pageHeader[navigateStringByCalcTypeMap[$geoObject.linkExistingCardType]])
const titleForAddButtonComputed: any = computed(
  () => titleForAddButton[navigateStringByCalcTypeMap[$geoObject.linkExistingCardType]],
)

const folderSelected = (folder: any) => {
  $catalogsTable.setActiveFolder(folder)
}

const findFolderByPath = (path: string[], folders: any): any => {
  let currentFolders = folders
  let currentFolder = null
  for (const part of path) {
    currentFolder = currentFolders.find((folder: any) => folder.name === part)
    if (currentFolder && currentFolder.children) {
      currentFolders = currentFolder.children
    } else {
      break
    }
  }
  return currentFolder
}

const updateActiveFolderFromRoute = () => {
  const hashName = route.hash.replace('#', '').split('>').map(decodeURIComponent)
  if (route.hash) {
    const folder = findFolderByPath(hashName, $catalogsTable.folders)
    if (folder) {
      $catalogsTable.setActiveFolder(folder)
    }
  }
}

watch(
  () => $catalogsTable.foldersLoading,
  (newValue) => {
    if (newValue === false) {
      updateActiveFolderFromRoute()
    }
  },
)

watch(
  () => `${route.path}${route.hash}`,
  () => {
    updateActiveFolderFromRoute()
  },
)

watch(
  () => $catalogsTable.activeFolder,
  (newValue) => {
    activeItem.value = newValue
  },
)

watch(
  () => $catalogsTable.activeObject,
  (newValue) => {
    activeItem.value = newValue
  },
)

onMounted(async () => {
  await $catalogsTable.appStartingFilterFunctions()
  if (Object.keys($catalogsTable.activeFolder).length === 0 && $catalogsTable.folders.length !== 0) {
    $catalogsTable.setActiveFolder($catalogsTable.folders[0])
  }
})

const isShowFiltersAdditionalParameters = computed(() => {
  const { $bvModal } = useNuxtApp()
  return $bvModal.isShowFiltersAdditionalParameters
})

const acceptParameters = (data: any) => {
  const currentDate = new Date().toISOString().split('T')[0]

  const query = {
    name: data.name,
    description: data.description,
    modified_date: currentDate,
  }

  console.log('feature-query', query)

  $http.patch(`/api/v1/catalog/catalogs/${data.id}/`, { body: query })
  $catalogsTable.updateFolder(data.id)
}

const onOpenFeature = (folder: any) => {
  if (folder && folder.children) {
    dataFolder.value = folder
    showModalFeatures.value = true
  }
}

const onDeleteFolder = (folder: any) => {
  $catalogsTable.deleteFolder(folder)
  if (folder === $catalogsTable.activeFolder) {
    $catalogsTable.setActiveFolder($catalogsTable.folders[0])
  } else {
    $catalogsTable.processFolder()
  }
}

const handleDrop = async (object: any) => {
  const draggedFolder = object.draggedFolder
  const targetFolder = object.targetFolder
  if (draggedFolder && targetFolder && draggedFolder.id !== targetFolder.id) {
    // Проверка, чтобы избежать цикличности
    console.log('onDrop-start-2')

    if (isDescendant(draggedFolder, targetFolder)) {
      console.warn('Нельзя перемещать папку в саму себя или её потомков')
      return
    }

    const requestBody = {
      target_ids: [draggedFolder.id],
      parent_id: targetFolder.id,
    }

    try {
      await $http.post(`/api/v1/catalog/catalogs/move/`, { body: requestBody })
      // Обновление состояния после успешного перемещения
      $catalogsTable.removeFolder(draggedFolder.id)
      await $catalogsTable.updateFolder(targetFolder.id)
    } catch (error) {
      console.error('Ошибка при перемещении папки:', error)
    }
  }
}

// Проверка на вложенность
const isDescendant = (dragged: any, target: any) => {
  if (!dragged.children) return false
  if (dragged.children.some((child: any) => child.id === target.id)) return true
  return dragged.children.some((child: any) => isDescendant(child, target))
}
</script>

<style lang="scss" scoped>
.side-bar {
  padding-right: 1.25rem;
  border-right: 0.0625rem solid rgb(134, 141, 146);
  &__header {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.375rem 0;
    margin-bottom: 1rem;
    font-size: 1.125rem;
    font-weight: 800;
    line-height: 135%;
    letter-spacing: 0.01rem;

    .icon {
      width: 1.25rem;
      height: 1.25rem;
    }
  }

  .search {
    :deep(.input-group-solid) {
      padding: 0.5rem 0 0.625rem;
      border-right: 0;
      border-left: 0;
      border-radius: 0;

      input {
        border-color: black;
        border-radius: 0.31rem;
        padding: 0.5rem 0.625rem;
        font-size: 0.875rem;
        padding-right: 2.5rem;
      }
    }
  }
}
</style>
