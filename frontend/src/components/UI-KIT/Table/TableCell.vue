<template>
  <td>{{ tableCellValue }}</td>
</template>

<script lang="ts" name="TableCell" setup>
const props = defineProps({
  tableCellValue: {
    type: String,
    required: true,
  },
})
</script>
