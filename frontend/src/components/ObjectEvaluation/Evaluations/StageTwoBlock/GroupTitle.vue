<template>
  <tr>
    <td
      :colspan="
        props.displayedAnalogsLength + (props.tabTitle !== stageTabName2 && props.tabTitle !== stageTabName3 ? 3 : 2)
      "
      class="h5 text-primary-emphasis"
    >
      {{ props.title }}
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { stageTabName2, stageTabName3 } from '~/app_constants/calculationsConsts'

interface Props {
  tabTitle: string
  title: string
  displayedAnalogsLength: number
}

const props = defineProps<Props>()
</script>
