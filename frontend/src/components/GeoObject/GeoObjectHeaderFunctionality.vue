<template>
  <div
    id="readonly-button"
    :class="
      $geoObject.readOnly
        ? 'map-object-properties_header_toggle__start map-object-properties_header_toggle__toggled'
        : 'map-object-properties_header_toggle__end'
    "
    class="map-object-properties_header_toggle ms-auto"
    @click="
      () => {
        toggle()
      }
    "
  >
    <span
      :class="
        $geoObject.readOnly
          ? 'map-object-properties_header_toggle_icon_blocked'
          : 'map-object-properties_header_toggle_icon'
      "
    >
      <i :class="$geoObject.readOnly ? 'form_toggle_blocked' : 'fi_edit-2'" class="icon caret-icon"></i>
    </span>
  </div>
  <div v-if="$geoObject.readOnly" class="custom-tooltip-wrapper">
    <BTooltip
      :no-fade="true"
      :placement="'bottom'"
      :target="'readonly-button'"
      custom-class="custom-tooltip"
      triggers="hover"
    >
      <div class="readonly-button-tooltip">Нажмите для перехода в режим редактирования карточки объекта</div>
    </BTooltip>
  </div>
  <!-- <div :class="!excludedSectionsForToggle.includes(currentSection) ? 'ms-4' : 'ms-auto'">
      <BDropdown
        v-model="dropdownShow"
        :menu-class="[
          'nav-item-dropdown-files_menu shadow nav-item-dropdown-files_menu__last',
          { 'd-block': dropdownShow },
        ]"
        no-caret
        right
        toggleClass="btn-sm-rounded"
        variant="outline-secondary"
      >
        <template #button-content>
          <i class="tab_files_body_section_files_file_header_menu_icon icon fi_more-vertical" />
        </template>
        <template v-if="mutableData.object_type_calc == 'OA'">
          <BDropdownItem :disabled="isNew || !isBaseFieldsReady || readOnlyComputed" @click="emit('setDefault')">
            <div><i class="file_menu_icon icon fi_edit" />Дозаполнить карточку автоматически</div>
          </BDropdownItem>
          <BDropdownDivider />
        </template>
        <BDropdownItem
          :disabled="
            isNew ||
            ($auth.user!.id !== 1 ? isRequiredFieldsReady || mutableData.added_by !== $auth.user!.id : false) ||
            !removeButtonAccessPerms.some((perm) => userPermissions.includes(perm))
          "
          @click="emit('deleteObj')"
        >
          <div><i class="file_menu_icon icon fi_trash-2" />Удалить</div>
        </BDropdownItem>
      </BDropdown>
    </div> -->
</template>

<script setup lang="ts">
import { excludedSectionsForToggle } from '~/app_constants/mapObjectConsts'
import useUserPermissions from '~/composables/useUserPermissions'

const emit = defineEmits(['deleteObj', 'setDefault'])
const { $geoObject, $auth } = useNuxtApp()
//   const removeButtonAccessPerms = ['DC', 'ADMIN']
//   const updateSwitcherAccessPerms = ['UC', 'ADMIN']
//   const userPermissions: string[] = useUserPermissions($auth.user?.permissions)
//   const dropdownShow = ref(false)

function toggle() {
  // if (updateSwitcherAccessPerms.some((perm) => userPermissions.includes(perm))) {
  $geoObject.toggleReadOnly()
  // }
}
</script>

<style scoped></style>
