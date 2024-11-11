<template>
  <div class="d-flex align-items-center default-font">
    <button
      class="ms-2 btn btn-lg btn-outline-secondary p-2 px-3 d-flex align-items-center justify-content-center fw-bold"
      @click="
        () => {
          if ($geoObject.linkExistingCardTable) {
            $geoObject.returnToObjectFromLinkingCards()
          } else $geoObject.returnToObjectFromLinkingObjects()
        }
      "
    >
      <i class="icon fi_arrow-left me-2" />
      Вернуться к объекту
    </button>
    <span class="ms-3">
      {{
        'выбрано объектов: ' +
        ($geoObject.linkExistingCardTable
          ? $geoObject.linkExistingCardIds.length
          : $geoObject.linkExistingObjectsIds.length)
      }}
    </span>
    <div class="d-flex align-items-center link-existing-table_footer_alert ms-2">
      <i class="icon fi_alert-circle ms-3 me-2" />Для привязки объектов к родительскому объекту, отметьте нужные объекты
      и нажмите кнопку “Вернуться...”
    </div>
  </div>
</template>

<script setup lang="ts">
const { $geoObject } = useNuxtApp()
</script>

<style scoped></style>
