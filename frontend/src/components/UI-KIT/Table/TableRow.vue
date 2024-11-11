<template>
  <tr
    :class="{
      'table-info': toggle1,
      'table-warning': toggle2,
    }"
  >
    <TableCell
      v-for="(tableCell, index) in tableRow"
      :key="index"
      :table-cell-value="
        typeof tableCell !== 'number'
          ? String(tableCell)
          : String(isFormula ? Number(tableCell) : Number(tableCell).toFixed(2))
      "
    />
  </tr>
</template>

<script lang="ts" name="TableRow" setup>
import TableCell from '~/components/UI-KIT/Table/TableCell.vue'

const props = defineProps({
  tableRow: {
    type: Array<string | number>,
    required: true,
  },
  isFormula: {
    type: Boolean,
    required: true,
  },
})

const toggle1 = typeof props.tableRow[2] === 'string'
const toggle2 = props.tableRow[1] === ''
</script>
