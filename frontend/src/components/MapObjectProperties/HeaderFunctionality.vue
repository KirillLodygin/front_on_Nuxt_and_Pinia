<template>
  <div
    v-show="!excludedSectionsForToggle.includes(props.currentSection)"
    id="readonly-button"
    :class="
      readOnlyComputed
        ? 'map-object-properties_header_toggle__start map-object-properties_header_toggle__toggled'
        : 'map-object-properties_header_toggle__end'
    "
    class="map-object-properties_header_toggle ms-auto"
    @click="toggle"
  >
    <span
      :class="
        readOnlyComputed
          ? 'map-object-properties_header_toggle_icon_blocked'
          : 'map-object-properties_header_toggle_icon'
      "
    >
      <i :class="readOnlyComputed ? 'form_toggle_blocked' : 'fi_edit-2'" class="icon caret-icon"></i>
    </span>
  </div>

  <div v-if="readOnlyComputed && props.mutableData.func_purpose.name !== 'Прочее'" class="custom-tooltip-wrapper">
    <BTooltip
      :no-fade="true"
      placement="bottom"
      target="readonly-button"
      custom-class="custom-tooltip"
      triggers="hover"
    >
      <div class="readonly-button-tooltip">Нажмите для перехода в режим редактирования карточки объекта</div>
    </BTooltip>
  </div>

  <div :class="!excludedSectionsForToggle.includes(props.currentSection) ? 'ms-4' : 'ms-auto'">
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

      <BDropdownItem :disabled="readOnlyComputed || props.isFormChanged" @click="emit('synchronizationCardData')">
        <div><i class="file_menu_icon icon fi_edit icon-lg" />Авто-заполнение гео-данных</div>
      </BDropdownItem>

      <template v-if="props.mutableData.object_type_calc == 'OA'">
        <BDropdownItem
          :disabled="props.isNew || !props.isBaseFieldsReady || readOnlyComputed"
          @click="emit('setDefault')"
        >
          <div><i class="file_menu_icon icon fi_edit icon-lg" />Дозаполнить карточку автоматически</div>
        </BDropdownItem>
        <BDropdownItem disabled>
          <div><i class="file_menu_icon icon fi_file-text icon-lg" />Выгрузить описание объекта недвижимости</div>
        </BDropdownItem>
      </template>

      <BDropdownDivider />

      <BDropdownItem
        :disabled="
          props.isNew ||
          ($auth.user!.id !== 1
            ? props.isRequiredFieldsReady || props.mutableData.added_by !== $auth.user!.id
            : false) ||
          !removeButtonAccessPerms.some((perm) => userPermissions.includes(perm))
        "
        @click="emit('deleteObj')"
      >
        <div><i class="file_menu_icon icon fi_trash-2 icon-lg" />Удалить</div>
      </BDropdownItem>
    </BDropdown>
  </div>
</template>

<script setup lang="ts">
import { excludedSectionsForToggle } from '~/app_constants/mapObjectConsts'
import useUserPermissions from '~/composables/useUserPermissions'

interface Props {
  isBaseFieldsReady: boolean
  isRequiredFieldsReady: boolean
  isFormChanged: boolean
  mutableData: Record<string, any>
  isNew: boolean
  currentSection: string
}

const props = defineProps<Props>()
const emit = defineEmits(['deleteObj', 'setDefault', 'synchronizationCardData'])

const { $objectStore, $auth } = useNuxtApp()
const removeButtonAccessPerms = ['DC', 'ADMIN']
const updateSwitcherAccessPerms = ['UC', 'ADMIN']
const userPermissions = useUserPermissions($auth.user?.permissions)
const dropdownShow = ref(false)

const readOnlyComputed = computed(() => $objectStore.readOnly)

function toggle() {
  if (updateSwitcherAccessPerms.some((perm) => userPermissions.includes(perm))) {
    $objectStore.toggleReadOnly()
  }
}
</script>

<style scoped></style>
