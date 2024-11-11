<template>
  <li class="mb-2" style="list-style-type: none">
    <div class="d-flex align-items-center">
      <i
        :class="['icon me-2', isExpanded ? 'fi_chevron-down' : 'fi_chevron-right', { fi_minus: !hasChildren }]"
        @click="toggleExpanded"
      ></i>
      <div>Какой-то непонятный элемент дерева №{{ node.name }}</div>
    </div>
    <ul v-if="hasChildren && isExpanded">
      <TreeNode v-for="child in node.children" :key="child.id" :node="child" />
    </ul>
  </li>
</template>

<script lang="ts" setup>
import type { treeNodeType } from '~/types/treeTypes'

interface Props {
  node: treeNodeType
}

const props = defineProps<Props>()
const isExpanded = ref(false)

const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}
</script>
