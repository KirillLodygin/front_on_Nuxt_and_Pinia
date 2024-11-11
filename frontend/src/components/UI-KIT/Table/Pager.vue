<!--
    Переключатель страниц
-->
<template>
  <div v-if="props.pages > 0 && props.records > 0" class="btn-toolbar" role="toolbar">
    <nav v-if="props.pages > 1" title="Навигация по страницам таблицы" class="me-2">
      <ul class="pagination mb-0">
        <template v-if="showFirstPage">
          <li class="page-item">
            <a class="page-link" href="#" @click.prevent="changePage(1)">1</a>
          </li>
          <li class="page-item disabled">
            <a class="page-link" href="#" tabindex="-1">...</a>
          </li>
        </template>
        <template v-for="fpage in visiblePages">
          <li class="page-item" :class="{ active: fpage === props.page, disabled: fpage === props.page }">
            <a class="page-link" href="#" @click.prevent="changePage(fpage)">{{ fpage }}</a>
          </li>
        </template>
        <template v-if="showLastPage">
          <li class="page-item disabled">
            <a class="page-link" href="#" tabindex="-1">...</a>
          </li>
          <li class="page-item">
            <a class="page-link" href="#" @click.prevent="changePage(props.pages)">{{ props.pages }}</a>
          </li>
        </template>
      </ul>
    </nav>
    <nav v-if="props.records" class="justify-content-end me-2">
      <ul class="pagination mb-0">
        <li class="page-item">
          <a class="page-link" href="#" @click.prevent="refreshRecords()" title="Обновить таблицу">
            <i class="icon fi_redo"></i>
          </a>
        </li>
      </ul>
    </nav>
    <div v-if="props.records" class="pagination btn-group-label me-auto">
      {{ props.recordsLabel }}: {{ props.records }}
      <span v-if="props.filtered" class="text-secondary p-1" title="Применён фильтр">
        <i class="icon filter"></i>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  pages: { type: Number, default: 1 },
  page: { type: Number, default: 1 },
  records: { type: Number, default: 0 },
  recordsLabel: { type: String, default: 'всего записей' },
  filtered: { type: Boolean, default: false },
})

const emit = defineEmits(['onChange', 'onRefresh'])
const { $filtersStore } = useNuxtApp()
const visiblePages = computed(() => {
  const pages = []
  const startPage = Math.max(props.page - 2, 1)
  const endPage = Math.min(props.page + 2, props.pages)

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
})

const showFirstPage = computed(() => props.page > 4)
const showLastPage = computed(() => props.page < props.pages - 3)

const changePage = (page: Number) => {
  emit('onChange', page)
  $filtersStore.setPage(Number(page))
}

const refreshRecords = () => {
  emit('onRefresh')
}
</script>
