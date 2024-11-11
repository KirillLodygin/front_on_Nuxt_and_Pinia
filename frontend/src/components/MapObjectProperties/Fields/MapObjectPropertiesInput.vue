<template>
  <template v-if="field === 'floor_number'">
    <MapObjectPropertiesInputLabel
      :info="info"
      :object-data="objectData"
      :required-computed="requiredComputed"
      :class="`col-${single ? '12' : '6'} order-${index}`"
    />
    <div
      :class="[
        'input-and-icon d-flex',
        { disabled: disabledComputed },
        `col-${single ? '12' : '6'} order-${index + 2}`,
      ]"
    >
      <div
        :class="[
          disabledComputed ? 'map-object-properties_body_input__disabled' : '',
          !floorValue && !disabledComputed ? 'is-invalid' : 'is-valid',
        ]"
        class="map-object-properties_body_input form-control form-control-lg"
        @mousedown="
          () => {
            if (disabledComputed) return
            openFloorInput = true
            console.log(openFloorInput)
          }
        "
      >
        <i class="map-object-properties_floor-icon background-icon icon fi_more-horizontal caret-icon" />
        {{ floorValue }}
      </div>
      <BModal v-model="openFloorInput" bodyClass="mt-3 mb-4" title="ЭТАЖ РАСПОЛОЖЕНИЯ" size="xl"
        ><FloorInput
          v-if="openFloorInput"
          ref="floorInput"
          :default-prop="typeof data === 'string' ? JSON.parse(data) : { ...data }"
          :disabled="disabledComputed"
          :field="field"
          :object-area="objectArea"
          :options="objectData.choices"
          :required="requiredComputed"
          class="select"
          @close="() => (openFloorInput = false)"
          @update-mutable-data="
            (field: any, value: any, floorValueEmit: string) => {
              setFloorValueEmit(floorValueEmit)
              emit('updateMutableData', field, value)
              openFloorInput = false
            }
          "
        />
        <template #footer="{ ok, cancel }">
          <button
            class="btn btn-lg btn-outline-secondary"
            @click="
              () => {
                cancel()
              }
            "
          >
            Отмена
          </button>
          <button
            :disabled="!floorInput?.isReady || !floorInput?.isNullCheckReady"
            class="ms-2 btn btn-lg btn-primary"
            @click="floorInput?.createResult"
          >
            Сохранить
          </button>
        </template>
      </BModal>
    </div>
  </template>
  <template v-else-if="field === 'address_raw'">
    <MapObjectPropertiesInputLabel
      :info="info"
      :object-data="objectData"
      :required-computed="requiredComputed"
      :class="`col-${single ? '12' : '6'} order-${index}`"
    />
    <div
      :class="[
        'input-and-icon d-flex',
        { disabled: disabledComputed },
        `col-${single ? '12' : '6'} order-${index + 2}`,
      ]"
    >
      <AddressInput
        :default-value="mutableData.address_raw"
        :disabled="disabledComputed"
        :required="requiredComputed"
        :only-buildings="!!isRealtyObject"
        @update-mutable-data="
          (field, value) => {
            console.log('@update-mutable-data mapObjectPropertiesInput')
            emit('updateMutableData', field, value)
          }
        "
        @return-address="
          (lngLat: any, address: string, osm_id: number, geo_json: Geometry) => {
            console.log('@return-address mapObjectPropertiesInput')
            returnAddress(lngLat, address, osm_id, geo_json)
          }
        "
      />
      <i
        v-if="findMap"
        :id="objectData && objectData.label"
        :role="!disabledComputed ? 'button' : ''"
        class="map-object-properties_find_map background-icon icon icon-lg form_find-map caret-icon"
        @click="findInMap"
      />

      <div v-if="findMap" class="custom-tooltip-wrapper">
        <BTooltip
          :no-fade="true"
          :placement="'top'"
          :target="objectData && objectData.label"
          custom-class="custom-tooltip"
          triggers="hover"
        >
          <div class="find-map-button-tooltip">
            {{ findMap }}
          </div>
        </BTooltip>
      </div>
      <div v-if="specifyMap" :id="objectData && objectData.label" :style="specifyMapCssProp" class="find-map"></div>
      <BTooltip
        v-if="specifyMap"
        :target="objectData && objectData.label"
        custom-class="custom-tooltip"
        triggers="hover"
        >{{ specifyMap }}
      </BTooltip>
    </div>
    <MapModal
      v-model="mapModal"
      :address-from-map="true"
      :is-analog-map-modal="true"
      :is-realty-object="!!isRealtyObject"
      :marker="{ lat: coordinates![1], lng: coordinates![0] }"
      @return-address="
        (lngLat: any, address: string, osm_id: number, geo_json: Geometry) =>
          returnAddress(lngLat, address, osm_id, geo_json)
      "
      @return-to-card="mapModal = false"
    />
  </template>

  <template v-else-if="field === 'parent'" class="input-wrapper">
    <MapObjectPropertiesInputLabel
      :info="info"
      :object-data="objectData"
      :required-computed="requiredComputed"
      :class="`col-${single ? '12' : '6'} order-${index}`"
    />
    <div class="input-and-icon" :class="`col-${single ? '12' : '6'} order-${index + 2}`">
      <BFormInput
        v-model="parentValue"
        :disabled="disabledComputed"
        :required="requiredComputed"
        :state="requiredComputed ? !!value : true"
        autocomplete="none"
        class="map-object-properties_body_input form-control form-control-lg"
        @input="updateMutableDataByField"
      ></BFormInput>
      <i
        class="icon fi_inner-link-alt background-icon icon-lg"
        @click="navigateTo({ path: `/real_estate/${value.id}`, hash: '#Базовые поля' })"
        v-if="value"
      />
    </div>
  </template>

  <template v-else-if="objectData && field.includes('coord')" class="input-wrapper">
    <MapObjectPropertiesInputLabel
      :info="info"
      :object-data="objectData"
      :required-computed="requiredComputed"
      :class="`col-${single ? '12' : '6'} order-${index}`"
    />
    <div class="input-and-icon" :class="`col-${single ? '12' : '6'} order-${index + 2}`">
      <BFormInput
        v-model="value"
        :disabled="disabledComputed"
        :formatter="decimalFormatter"
        :required="requiredComputed"
        :max="field.includes('lat') ? 90 : 180"
        :min="field.includes('lat') ? -90 : -180"
        :state="(requiredComputed ? !!value : true) && isValidCoordinate(value, field.includes('lat'))"
        :placeholder="field.includes('lat') ? 'Широта (например, 40.7128)' : 'Долгота (например, -74.0060)'"
        autocomplete="none"
        class="map-object-properties_body_input form-control form-control-lg"
        @input="sanitizeInput"
      ></BFormInput>

      <BFormInvalidFeedback v-if="!isValidCoordinate(value, field.includes('lat'))">
        {{
          field.includes('lat')
            ? 'Некорректная широта. Значение должно быть от -90 до 90.'
            : 'Некорректная долгота. Значение должно быть от -180 до 180.'
        }}
      </BFormInvalidFeedback>
      <div v-if="findMap" :id="objectData && objectData.label" :style="findMapCssProp" class="find-map"></div>
      <BTooltip v-if="findMap" :target="objectData && objectData.label" custom-class="custom-tooltip" triggers="hover"
        >{{ findMap }}
      </BTooltip>
      <div v-if="specifyMap" :id="objectData && objectData.label" :style="specifyMapCssProp" class="find-map"></div>
      <BTooltip
        v-if="specifyMap"
        :target="objectData && objectData.label"
        custom-class="custom-tooltip"
        triggers="hover"
        >{{ specifyMap }}
      </BTooltip>
    </div>
  </template>
  <template v-else-if="objectData && objectData.type === 'field'" class="input-wrapper">
    <MapObjectPropertiesInputLabel
      :info="info"
      :object-data="objectData"
      :required-computed="requiredComputed"
      :class="`col-${single ? '12' : '6'} order-${index}`"
    />
    <div class="input-and-icon" :class="`col-${single ? '12' : '6'} order-${index + 2}`">
      <BFormInput
        v-model="value"
        :disabled="disabledComputed"
        :required="requiredComputed"
        :state="requiredComputed ? !!value : true"
        autocomplete="none"
        class="map-object-properties_body_input form-control form-control-lg"
        @input="updateMutableDataByField"
      ></BFormInput>
      <div v-if="findMap" :id="objectData && objectData.label" :style="findMapCssProp" class="find-map"></div>
      <BTooltip v-if="findMap" :target="objectData && objectData.label" custom-class="custom-tooltip" triggers="hover"
        >{{ findMap }}
      </BTooltip>
      <div v-if="specifyMap" :id="objectData && objectData.label" :style="specifyMapCssProp" class="find-map"></div>
      <BTooltip
        v-if="specifyMap"
        :target="objectData && objectData.label"
        custom-class="custom-tooltip"
        triggers="hover"
        >{{ specifyMap }}
      </BTooltip>
    </div>
  </template>
  <template
    v-else-if="objectData && objectData.type === 'integer'"
    :class="`col-${single ? '12' : '6'} order-${index}`"
    class="input-wrapper"
  >
    <MapObjectPropertiesInputLabel
      :info="info"
      :object-data="objectData"
      :required-computed="requiredComputed"
      :class="`col-${single ? '12' : '6'} order-${index}`"
    />
    <div class="input-and-icon" :class="`col-${single ? '12' : '6'} order-${index + 2}`">
      <BFormInput
        v-if="field === 'ads_num'"
        v-model.number="value"
        :disabled="disabledComputed"
        :formatter="integerFormatter"
        :no-wheel="true"
        :required="requiredComputed"
        :state="requiredComputed ? !!value : true"
        :type="'number'"
        autocomplete="none"
        class="map-object-properties_body_input form-control form-control-lg"
        step="1"
        @input="updateMutableDataByField"
      ></BFormInput>
      <BFormInput
        v-else-if="field !== 'ads_num' && !indicatorChange"
        :id="'input_' + field"
        v-model="modelNumber"
        :class="unavailable ? 'form-control__unavailable' : ''"
        :disabled="disabledComputed"
        :formatter="integerFormatter"
        :max="objectData.max_value"
        :min="objectData.min_value"
        :required="requiredComputed"
        :state="
          (requiredComputed ? !!value : true) &&
          objectData.min_value - 1 < modelNumber &&
          modelNumber < objectData.max_value + 1
        "
        autocomplete="none"
        class="map-object-properties_body_input form-control form-control-lg"
        data="1"
        type="text"
        @focus="
          () => {
            changeInput()
          }
        "
      ></BFormInput>
      <BFormInput
        v-else-if="field !== 'ads_num' && indicatorChange"
        :id="'input_' + field"
        v-model="modelNumber"
        :class="unavailable ? 'form-control__unavailable' : ''"
        :disabled="disabledComputed"
        :formatter="integerFormatter"
        :max="objectData.max_value"
        :min="objectData.min_value"
        :no-wheel="true"
        :required="requiredComputed"
        :state="requiredComputed ? !!value : true"
        autocomplete="none"
        class="map-object-properties_body_input form-control form-control-lg"
        data="2"
        step="1"
        type="number"
        @blur="
          () => {
            indicatorChange = false
          }
        "
      ></BFormInput>
      <div v-if="findMap" :id="objectData && objectData.label" :style="findMapCssProp" class="find-map"></div>
      <BTooltip v-if="findMap" :target="objectData && objectData.label" custom-class="custom-tooltip" triggers="hover"
        >{{ findMap }}
      </BTooltip>
      <div v-if="specifyMap" :id="objectData && objectData.label" :style="specifyMapCssProp" class="find-map"></div>
      <BTooltip
        v-if="specifyMap"
        :target="objectData && objectData.label"
        custom-class="custom-tooltip"
        triggers="hover"
        >{{ specifyMap }}
      </BTooltip>
    </div>
  </template>
  <template
    v-else-if="objectData && objectData.type === 'decimal'"
    :class="unavailable ? 'input-wrapper__unavailable' : ''"
    class="input-wrapper"
  >
    <MapObjectPropertiesInputLabel
      :double-line-label="doubleLineLabel"
      :info="info"
      :object-data="objectData"
      :required-computed="requiredComputed"
      :class="`col-${single ? '12' : '6'} order-${index}`"
    />
    <div class="input-and-icon" :class="`col-${single ? '12' : '6'} order-${index + 2}`">
      <BFormInput
        v-if="!indicatorChange"
        :id="'input_' + field"
        v-model="modelNumber"
        :class="unavailable ? 'form-control__unavailable' : ''"
        :disabled="disabledComputed"
        :required="requiredComputed"
        :state="!requiredComputed ? true : !!value"
        class="map-object-properties_body_input form-control form-control-lg"
        @focus="
          () => {
            changeInput()
          }
        "
      ></BFormInput>
      <BFormInput
        v-else
        :id="'input_' + field"
        v-model="modelNumber"
        :class="unavailable ? 'form-control__unavailable' : ''"
        :disabled="disabledComputed"
        :no-wheel="true"
        :required="requiredComputed"
        :state="!requiredComputed ? true : !!value"
        autocomplete="none"
        class="map-object-properties_body_input form-control form-control-lg"
        @keypress="
          (e) => {
            if (!e.key.toString().replace(/[^0-9.,]+/g, '').length) {
              e.preventDefault()
            }
          }
        "
        @blur="
          () => {
            indicatorChange = false
          }
        "
      ></BFormInput>

      <div v-if="findMap" :id="objectData && objectData.label" :style="findMapCssProp" class="find-map"></div>
      <BTooltip v-if="findMap" :target="objectData && objectData.label" custom-class="custom-tooltip" triggers="hover"
        >{{ findMap }}
      </BTooltip>
      <div v-if="specifyMap" :id="objectData && objectData.label" :style="specifyMapCssProp" class="find-map"></div>
      <BTooltip
        v-if="specifyMap"
        :target="objectData && objectData.label"
        custom-class="custom-tooltip"
        triggers="hover"
        >{{ specifyMap }}
      </BTooltip>
    </div>
  </template>
  <template v-else-if="objectData && objectData.type === 'float'" class="input-wrapper">
    <MapObjectPropertiesInputLabel
      :info="info"
      :object-data="objectData"
      :required-computed="requiredComputed"
      :class="`col-${single ? '12' : '6'} order-${index}`"
    />
    <div class="input-and-icon" :class="`col-${single ? '12' : '6'} order-${index + 2}`">
      <BFormInput
        v-model.number="modelNumber"
        :disabled="disabledComputed"
        :no-wheel="true"
        :required="requiredComputed"
        :state="requiredComputed ? !!value : true"
        :type="indicatorChange ? 'number' : 'text'"
        autocomplete="none"
        class="map-object-properties_body_input form-control form-control-lg"
        @blur="indicatorChange = false"
        @focus="
          () => {
            indicatorChange = true
            value = value ? value : ''
          }
        "
      ></BFormInput>
      <div v-if="findMap" :id="objectData && objectData.label" :style="findMapCssProp" class="find-map"></div>
      <BTooltip v-if="findMap" :target="objectData && objectData.label" custom-class="custom-tooltip" triggers="hover"
        >{{ findMap }}
      </BTooltip>
      <div v-if="specifyMap" :id="objectData && objectData.label" :style="specifyMapCssProp" class="find-map"></div>
      <BTooltip
        v-if="specifyMap"
        :target="objectData && objectData.label"
        custom-class="custom-tooltip"
        triggers="hover"
        >{{ specifyMap }}
      </BTooltip>
    </div>
  </template>
  <template
    v-else-if="objectData && objectData.type === 'date'"
    :class="unavailable ? 'input-wrapper__unavailable input-wrapper' : 'input-wrapper'"
  >
    <MapObjectPropertiesInputLabel
      :info="info"
      :object-data="objectData"
      :required-computed="requiredComputed"
      :class="`col-${single ? '12' : '6'} order-${index}`"
    />
    <div class="input-and-icon" :class="`col-${single ? '12' : '6'} order-${index + 2}`">
      <DatePickerInput
        :id="`${field}_${index}`"
        v-model="dateInputValue"
        :class="unavailable ? 'form-control__unavailable' : 'date-input'"
        :disabled="disabledComputed"
        :max="today"
        :required="requiredComputed"
        :state="requiredComputed ? !!value && new Date(value).getTime() > new Date('1900-01-01').getTime() : true"
        autocomplete="none"
        class="map-object-properties_body_input form-control form-control-lg"
        @input="updateMutableDataByField"
      />
      <div v-if="findMap" :id="objectData && objectData.label" :style="findMapCssProp" class="find-map"></div>
      <BTooltip v-if="findMap" :target="objectData && objectData.label" custom-class="custom-tooltip" triggers="hover"
        >{{ findMap }}
      </BTooltip>
      <div v-if="specifyMap" :id="objectData && objectData.label" :style="specifyMapCssProp" class="find-map"></div>
      <BTooltip
        v-if="specifyMap"
        :target="objectData && objectData.label"
        custom-class="custom-tooltip"
        triggers="hover"
        >{{ specifyMap }}
      </BTooltip>
    </div>
  </template>

  <template
    v-else-if="objectData && objectData.type === 'string'"
    :class="unavailable ? 'input-wrapper__unavailable' : ''"
    class="input-wrapper"
  >
    <MapObjectPropertiesInputLabel
      :info="info"
      :object-data="objectData"
      :required-computed="requiredComputed"
      :class="`col-${single ? '12' : '6'} order-${index}`"
    />
    <div
      v-if="!objectData.max_length && objectData && objectData.type !== 'text'"
      class="input-and-icon"
      :class="`col-${single ? '12' : '6'} order-${index! + 2}`"
    >
      <textarea
        v-model="value"
        :disabled="disabledComputed"
        :required="requiredComputed"
        :state="requiredComputed ? !!value : true"
        class="map-object-properties_body_input form-control form-control-lg overflow-y-auto textarea-input"
        :class="(requiredComputed ? !!value : true) ? 'is-valid' : 'is-invalid'"
        max-rows="8"
        rows="0"
        size="sm"
        @input="updateMutableDataByField"
      ></textarea>
      <div v-if="findMap" :id="objectData && objectData.label" :style="findMapCssProp" class="find-map"></div>
      <div v-if="findMap" class="custom-tooltip-wrapper">
        <BTooltip
          :no-fade="true"
          :placement="'top'"
          :target="objectData && objectData.label"
          custom-class="custom-tooltip"
          triggers="hover"
        >
          <div class="find-map-button-tooltip">
            {{ findMap }}
          </div>
        </BTooltip>
      </div>

      <div v-if="specifyMap" :id="objectData && objectData.label" :style="specifyMapCssProp" class="find-map"></div>
      <BTooltip
        v-if="specifyMap"
        :target="objectData && objectData.label"
        custom-class="custom-tooltip"
        triggers="hover"
        >{{ specifyMap }}
      </BTooltip>
    </div>
    <div v-else class="input-and-icon" :class="`col-${single ? '12' : '6'} order-${index + 2}`">
      <BFormInput
        v-model="value"
        :class="unavailable ? 'form-control__unavailable' : ''"
        :disabled="disabledComputed"
        :required="requiredComputed"
        :state="value ? value.length < objectData.max_length : !requiredComputed"
        :maxlength="objectData.max_length - 1"
        autocomplete="none"
        class="map-object-properties_body_input form-control form-control-lg"
        type="text"
        @input="updateMutableDataByField"
      ></BFormInput>
      <div v-show="value && value.length > objectData.max_length - 1 && isRealtyObject" class="text-danger">
        Превышено допустимое кол-во символов
      </div>
      <div v-if="findMap" :id="objectData && objectData.label" :style="findMapCssProp" class="find-map"></div>
      <BTooltip v-if="findMap" :target="objectData && objectData.label" custom-class="custom-tooltip" triggers="hover">
        {{ findMap }}
      </BTooltip>
      <div v-if="specifyMap" :id="objectData && objectData.label" :style="specifyMapCssProp" class="find-map"></div>
      <BTooltip
        v-if="specifyMap"
        :target="objectData && objectData.label"
        custom-class="custom-tooltip"
        triggers="hover"
      >
        {{ specifyMap }}
      </BTooltip>
    </div>
  </template>
  <template
    v-else-if="objectData && objectData.type === 'datetime'"
    :class="unavailable ? 'input-wrapper__unavailable input-wrapper' : 'input-wrapper'"
  >
    <MapObjectPropertiesInputLabel
      :info="info"
      :object-data="objectData"
      :required-computed="requiredComputed"
      :class="`col-${single ? '12' : '6'} order-${index}`"
    />
    <div class="input-and-icon" :class="`col-${single ? '12' : '6'} order-${index + 2}`">
      <DatePickerInput
        :id="`${field}_${index}`"
        v-model="dateInputValue"
        :class="unavailable ? 'form-control__unavailable' : 'date-input'"
        :disabled="disabledComputed"
        :max="today"
        :required="requiredComputed"
        :state="requiredComputed ? !!value && new Date(value).getTime() > new Date('1900-01-01').getTime() : true"
        :type="'date'"
        autocomplete="none"
        class="map-object-properties_body_input form-control form-control-lg"
        @input="updateMutableDataByField"
      />
      <div v-if="findMap" :id="objectData && objectData.label" :style="findMapCssProp" class="find-map"></div>
      <BTooltip v-if="findMap" :target="objectData && objectData.label" custom-class="custom-tooltip" triggers="hover"
        >{{ findMap }}
      </BTooltip>
      <div v-if="specifyMap" :id="objectData && objectData.label" :style="specifyMapCssProp" class="find-map"></div>
      <BTooltip
        v-if="specifyMap"
        :target="objectData && objectData.label"
        custom-class="custom-tooltip"
        triggers="hover"
        >{{ specifyMap }}
      </BTooltip>
    </div>
  </template>
  <template
    v-else-if="objectData && objectData.type === 'choice' && !options"
    :class="unavailable ? 'input-wrapper__unavailable' : ''"
    class="input-wrapper"
  >
    <MapObjectPropertiesInputLabel
      :info="info"
      :object-data="objectData"
      :required-computed="requiredComputed"
      :class="`col-${single ? '12' : '6'} order-${index!}`"
    />

    <CustomSelect
      :key="keyRerender"
      :default="data"
      :disabled="disabledComputed"
      :field="field"
      :is-cube="isCube"
      :mutable-data="mutableData"
      :options="objectData.choices"
      :required="requiredComputed"
      :unavailable="unavailable"
      :disabled-modifier="disabledModifier"
      :class="`col-${single ? '12' : '6'} order-${index! + 2}`"
      @input="
        ($event: any) => {
          ;(value = $event), updateMutableDataByField()
        }
      "
      @rerender="keyRerender++"
    />
  </template>

  <template v-else-if="(objectData && objectData.type === 'nested object') || options" class="input-wrapper">
    <MapObjectPropertiesInputLabel
      :info="info"
      :object-data="objectData"
      :required-computed="requiredComputed"
      :class="`col-${single ? '12' : '6'} order-${index}`"
    />
    <CustomSelect
      v-if="!!options"
      :key="keyRerender"
      :default="value"
      :disabled="disabledComputed"
      :field="field"
      :is-cube="isCube"
      :mutable-data="mutableData"
      :options="options"
      :required="requiredComputed"
      :unavailable="unavailable"
      :disabled-modifier="disabledModifier"
      :class="`col-${single ? '12' : '6'} order-${index + 2}`"
      @input="
        ($event: any) => {
          ;(value = $event), updateMutableDataByField()
        }
      "
      @rerender="keyRerender++"
    />
  </template>
  <template v-else-if="objectData && objectData.type === 'url'" class="input-wrapper">
    <MapObjectPropertiesInputLabel
      :info="info"
      :object-data="objectData"
      :required-computed="requiredComputed"
      :class="`col-${single ? '12' : '6'} order-${index}`"
    />
    <div
      class="input-and-icon"
      :class="['input-and-icon d-flex position-relative', `col-${single ? '12' : '6'} order-${index + 2}`]"
    >
      <BFormInput
        v-model="value"
        :disabled="disabledComputed"
        :required="requiredComputed"
        :state="value ? value.length <= objectData.max_length : !requiredComputed"
        :maxlength="objectData.max_length"
        autocomplete="none"
        class="map-object-properties_body_input form-control form-control-lg"
        type="url"
        @input="updateMutableDataByField"
      ></BFormInput>
      <i class="icon fi_external-link background-icon" @click.stop="moveToUrl" type="button" />
      <div v-if="findMap" :id="objectData && objectData.label" :style="findMapCssProp" class="find-map"></div>
      <BTooltip v-if="findMap" :target="objectData && objectData.label" custom-class="custom-tooltip" triggers="hover"
        >{{ findMap }}
      </BTooltip>
      <div v-if="specifyMap" :id="objectData && objectData.label" :style="specifyMapCssProp" class="find-map"></div>
      <BTooltip
        v-if="specifyMap"
        :target="objectData && objectData.label"
        custom-class="custom-tooltip"
        triggers="hover"
        >{{ specifyMap }}
      </BTooltip>
    </div>
  </template>
</template>

<script lang="ts" setup>
import MapObjectPropertiesInputLabel from '~/components/MapObjectProperties/Fields/MapObjectPropertiesInputLabel.vue'
import CustomSelect from '~/components/UI-KIT/Selects/BaseCustomSelect.vue'
import MapModal from '~/components/UI-KIT/Modals/MapModal.vue'
import FloorInput from './FloorInput.vue'
import AddressInput from '../../UI-KIT/Inputs/AddressInput.vue'
import DatePickerInput from '~/components/UI-KIT/Inputs/DatePickerInput.vue'
import type { Geometry } from 'geojson'

// @ts-nocheck
interface Props {
  objectData: { [key: string]: any }
  field: string
  unavailable?: boolean
  disabled: boolean
  required: boolean
  isShare?: boolean
  info?: string
  findMap?: string
  specifyMap?: string
  options?: Array<any> | null
  isRealtyObject?: boolean
  data?: any
  isPreWritten?: Boolean
  isNew?: boolean
  objectArea?: any
  key?: number
  coordinates?: number[]
  isCube?: boolean
  mutableData: { [key: string]: any }
  doubleLineLabel?: boolean
  index: number
  single?: boolean
  disabledModifier?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits(['updateMutableDataByParent', 'updateMutableData', ''])
const { $objectStore, $filtersStore } = useNuxtApp()
// Data
const value = ref(
  props.isShare
    ? (+props.data * 100).toFixed(2).toLocaleString() + '%'
    : props.objectData && props.objectData.type === 'nested object' && props.data
      ? props.data.id
      : props.objectData && props.field === 'object_area'
        ? +props.data
        : props.objectData && props.objectData.type === 'datetime' && props.data !== null
          ? props.data.split('T')[0]
          : props.data,
)

const parentValue = computed(() => {
  if (value.value) {
    const data = `${value.value.name} #${value.value.id}`
    return data
  }
  return 'Не имеет родителя'
})

const dateInputValue = computed({
  get: () => value.value?.split('T')[0].split('-').reverse().join('.'),
  set: (newValue) => {
    value.value = newValue.split('.').reverse().join('-')
  },
})

function isValidCoordinate(value: string, lat: boolean): boolean {
  if (lat) {
    const latPattern = /^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/
    return latPattern.test(value)
  } else {
    const lonPattern = /^-?((1[0-7]\d(\.\d+)?|[1-9]?\d(\.\d+)?|180(\.0+)?))$/
    return lonPattern.test(value)
  }
}

const sanitizeInput = (event: any) => {
  const inputValue = event.target.value
  // Удаляем все символы, кроме цифр, точки и минуса
  event.target.value = inputValue.replace(/[^0-9.-]/g, '')
  if (props.field.includes('coord')) {
    if (props.field.includes('lat')) {
      if (-90 <= event.target.value && event.target.value <= 90) {
        value.value = event.target.value
      } else value.value = null
    } else {
      if (-180 <= event.target.value && event.target.value <= 180) {
        value.value = event.target.value
      } else value.value = null
    }
  } else value.value = event.target.value
  updateMutableDataByField()
}

const keyRerender = ref(0)
const indicatorChange = ref(false)

const requiredComputed = computed(() => {
  if (props.disabled) {
    return false
  } else {
    return props.required
  }
})

const disabledComputed = computed(() => {
  if (props.disabled) return props.disabled
  else if (props.unavailable) return true
  else if (props.isPreWritten || props.field.includes('share') || props.disabledModifier) return true
  else if (props.field !== 'func_purpose' && $objectStore.funcPurpose.name === 'Прочее') return true
  else return false
})

const modelNumber = computed({
  get() {
    return indicatorChange.value
      ? value.value
      : props.isShare
        ? value.value
        : props.field === 'year_built' || props.field.includes('coord') || value.value === null
          ? value.value
          : (+value.value)
              .toLocaleString(undefined, { maximumFractionDigits: 20 })
              .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/, ' ')
  },
  set(valueSet) {
    if (valueSet === '') {
      value.value = null
    } else {
      value.value = parseFloat(valueSet.replace(',', '.'))
    }

    updateMutableDataByField()
  },
})

const specifyMapCssProp = computed(() => {
  return { backgroundImage: `url(/img/specify-map-main.svg)` }
})

const findMapCssProp = computed(() => {
  return { backgroundImage: `url(/img/find-map-main.svg)` }
})

const today = computed(() => {
  // 15th in two months
  const maxDate = new Date()
  return maxDate.toISOString().split('T')[0]
})

// Watchers

watch(value, (newVal: any, oldVal) => {
  if (props.field.includes('coord')) {
    value.value = decimalFormatter(newVal)
  } else if (props.field === 'number' || props.field === 'decimal') {
    value.value = newVal.toLocaleString()
  } else if (props.field === 'ads_link') {
    value.value = newVal.replace(/\n|\r/g, '').replace(' ', '')
  }
})

const inputValue = computed({
  get: () => value.value,
  set: (newValue) => {
    value.value = newValue
  },
})

if (props.field !== 'coord_lng' && props.field !== 'coord_lat') {
  watch(
    () => props.mutableData[props.field],
    (newVal: any, oldVal) => {
      if (newVal === oldVal) return
      if (props.field === 'kadast_number') {
        value.value = newVal
      }
      if (props.field !== 'added_by' && props.field !== 'modified_by') {
        value.value = newVal === -1 ? null : props.isShare ? +(newVal * 100).toFixed(2).toLocaleString() + '%' : newVal
      }
      if (props.field === 'integer' || props.field === 'decimal') value.value = newVal === -1 ? null : newVal
      // $forceUpdate()
    },
    { deep: true },
  )
}

if (props.field === 'coord_lng') {
  watch(
    () => props.mutableData.geo_pos.coordinates,
    (newVal: any, oldVal) => {
      value.value = newVal[0]
    },
    { deep: true },
  )
}
if (props.field === 'coord_lat') {
  watch(
    () => props.mutableData.geo_pos.coordinates,
    (newVal: any, oldVal) => {
      value.value = newVal[1]
    },
    { deep: true },
  )
}

// Methods

function updateMutableDataByField() {
  setTimeout(() => {
    let currentValue = value.value

    if (props.objectData.type === 'integer' || props.objectData.type === 'decimal') {
      emit('updateMutableData', props.field, currentValue)
    } else if (props.field === 'ads_link') {
      emit('updateMutableData', props.field, currentValue.replaceAll(/\n|\r/g, '').replaceAll(' ', ''))
    } else {
      emit('updateMutableData', props.field, currentValue)
    }
  }, 0)
}

function integerFormatter(value: string) {
  return value.replace(/\D/g, '')
}

function changeInput() {
  // Show the input component
  indicatorChange.value = true
  value.value = value.value !== null ? value.value : null

  // Focus the component, but we have to wait
  // so that it will be showing first.
  nextTick(() => {
    if (document.getElementById('input_' + props.field)) {
      document.getElementById('input_' + props.field)?.focus()
    }
  })
}

function moveToUrl() {
  window.open(value.value)
}

async function getUserById(id: number) {
  if (!id) return
  if (id === 1 && props.field === 'added_by') {
    value.value = 'Автоматически'
    return
  }
  value.value = $filtersStore.usersArr.find((obj) => obj.value === id.toString())?.display_name
}

function returnAddress(lngLat: any, address: string, osm_id: number, geo_json: Geometry) {
  mapModal.value = false
  console.log({ lngLat: lngLat.lngLat, address: address })
  emit('updateMutableData', 'address_and_coord', {
    lngLat: lngLat.lngLat,
    address: address,
    osm_id: osm_id,
    geo_json: geo_json,
  })
}

function decimalFormatter(valueToReplace: string) {
  return valueToReplace ? valueToReplace.toString().replace(/[^0-9.,]+/g, '') : ''
}

// Created
if (props.isNew && (props.field === 'added_by' || props.field === 'modified_by')) {
  getUserById(props.data)
} else if (props.field === 'added_by' || props.field === 'modified_by') {
  getUserById(props.data)
}
const mapModal = ref(false)
const findInMap = () => {
  if (disabledComputed.value) return

  mapModal.value = true
}
const openFloorInput = ref(false)

function parseFloorResult(obj: any) {
  const opt = []

  let TRcumulative = 0
  for (const key in obj) {
    if (key.includes('TR')) {
      TRcumulative = TRcumulative + obj[key].area
    }
  }
  for (const key in obj) {
    if (!key.includes('TR'))
      opt.push({
        display_name: props.objectData.choices.filter((item: any) => item.value === key)[0].display_name,
        value: obj[key].area,
      })
  }
  if (TRcumulative) {
    opt.push({ display_name: '3 и выше', value: TRcumulative })
  }

  const result: any[] = []

  opt.map((item) => {
    return result.push(item.display_name + ' (' + ((item.value / props.objectArea) * 100).toFixed(2) + '%' + ')')
  })

  return result.join(', ')
}

const floorValue: Ref<string> = ref(
  props.field === 'floor_number'
    ? parseFloorResult(props.data && typeof props.data === 'string' ? JSON.parse(props.data) : { ...props.data })
    : '',
)

watch(
  () => props.mutableData.object_area,
  (newVal) => {
    floorValue.value = ''
  },
  { deep: true },
)

function setFloorValueEmit(val3: any) {
  floorValue.value = val3
}

function log(a: any) {
  console.log('log', a)
}

const floorInput = ref<InstanceType<typeof FloorInput>>()
</script>

<style scoped>
.text-danger {
  color: #dc3545;
  position: relative;
  margin-top: 10px;
}

.input-and-icon {
  position: relative;
}
</style>
