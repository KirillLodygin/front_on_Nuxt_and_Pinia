<template>
  <div class="overflow-hidden">
    <ul class="ps-0 h-100 overflow-y-auto overflow-x-auto">
      <TreeNode v-for="node in treeData" :key="node.id" :node="node" />
    </ul>
  </div>
</template>

<script lang="ts" setup>
import type { treeNodeType } from '~/types/treeTypes'
import TreeNode from '~/components/UI-KIT/Tree/TreeNode.vue'

interface Props {
  treeData: treeNodeType[]
}

const props = defineProps<Props>()
</script>
