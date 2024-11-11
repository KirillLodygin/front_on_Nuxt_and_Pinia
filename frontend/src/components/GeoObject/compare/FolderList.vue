<template>
  <div id="_listTitle" class="d-flex align-items-center py-1 px-1 gap-3">
    <div>Сохранённые сравнения</div>
    <div class="list-line"></div>
  </div>
  <ul id="_list" class="folder-list">
    <li
      v-for="compare in savedComparisons"
      :id="String(compare.id)"
      class="py-1 px-1 compare-node"
      :class="isSelectedNode(compare.id) ? 'selected-compare-node' : ''"
      style="list-style-type: none"
      @click="isOpenCompare(compare.id, compare.name)"
      @contextmenu.prevent="onCompareCtx($event, compare.id, compare.name)"
    >
      <i class="icon me-2 fi_compare"></i>
      {{ compare.name }}
    </li>
  </ul>
  <ks-dropdown ref="compareCtxMenu" :target="'_list'" drop-pos="pointer" mouseButton="manually">
    <div>
      <a class="dropdown-item" href="#" @click.prevent="setIsMiniInfoModal(true)">
        <i class="icon fi_edit-3 fa-fw me-1"></i> Переименовать
      </a>
    </div>
    <hr class="pb-0 m-0" />
    <div>
      <a class="dropdown-item" href="#" @click.prevent="deleteCompare()">
        <i class="icon fi_trash-2 fa-fw me-1"></i> Удалить
      </a>
    </div>
  </ks-dropdown>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import { ref, computed } from 'vue'
import { currentComparisonList } from '~/app_constants/comparisonConsts'
import KsDropdown from '~/components/MapComponent/KsDropdown.vue'

interface Props {
  setTabName: (tab: string) => void
}

const props = defineProps<Props>()

const { $comparison } = useNuxtApp()

const compareCtxMenu: any = ref(null)

const savedComparisons = computed(() =>
  $comparison.savedComparisonsList.map((compare) => ({
    id: compare.id,
    name: compare.name,
  })),
)
const isOpenCurrentCompareVal = computed(() => $comparison.compareId === currentComparisonList)

const compareId = computed(() => $comparison.compareId)

const emit = defineEmits(['setIsMiniInfoModal', 'isOpenCompare'])
const setIsMiniInfoModal = (bool: boolean) => {
  emit('setIsMiniInfoModal', bool)
}

const isOpenCompare = (newCompareId: number | string, newCompareName: string) => {
  if ($comparison.getIsCurrentComparisonObjectsChanged()) {
    $comparison.setSavedCompareId(Number(compareId.value))
    $comparison.onIsAlertSaveChangesOpen(true, Number(newCompareId), Number(compareId.value))
    return
  }

  $comparison.setCompareId(Number(newCompareId))
  props.setTabName(`${newCompareName}`)
  emit('isOpenCompare')
}

const onCompareCtx = (event: Event, compareId: number | string, label: string | number) => {
  if (compareCtxMenu.value) compareCtxMenu.value.show(event)
  $comparison.setCompareId(Number(compareId))
  $comparison.setCompareLabel(String(label))
}

const deleteCompare = () => {
  $comparison.onIsShowStub()
  $comparison.deleteCompare().then(() => {
    $comparison.isUpdateComparisonObjects([])
    $comparison.offIsShowStub()
  })
}

const isSelectedNode = (nodeId: number) => nodeId === compareId.value && !isOpenCurrentCompareVal.value
</script>
