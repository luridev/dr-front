<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue';
import { digitsMask, dynamicMask, nativeMasks, repeatMask, serialMask } from '@/forms/components/DrMaskedInput/config.support';
import { DrButton, DrInput, DrMaskedInput } from '@/index';
import type { DrInputExposed } from '@/forms/components/DrInput/types';
import type { DrMaskedInputStatus } from '@/forms/components/DrMaskedInput/types';
import type { DrMaskedInputStoryProps } from '@/forms/components/DrMaskedInput/types.support';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DrMaskedInputStoryProps>(), {
  mask: '000-000',
  readonly: false,
  disabled: false,
});

const value = ref('');
const serial = ref('AB1234');
const digits = ref('1234567');
const repeated = ref('123');
const dynamic = ref('AB123');
const renders = ref(0);
const activeMask = computed(() => props.variant === undefined ? props.mask : nativeMasks[props.variant]);
const phone = ref('');
const plain = ref('');
const status = ref<DrMaskedInputStatus>('empty');
const updates = ref<Array<string>>([]);
const lastEvent = ref('');
const input = useTemplateRef<DrInputExposed>('input');

watch(() => props.externalValue, (next) => {
  if (next !== undefined) {
    value.value = next;
  }
}, { immediate: true });

function handleUpdate(next: string) {
  updates.value.push(next);
  value.value = next;
}

function handleStatus(next: DrMaskedInputStatus) {
  status.value = next;
}

function handleEvent(event: FocusEvent | KeyboardEvent | WheelEvent) {
  lastEvent.value = event.type;
}

function rerender() {
  renders.value += 1;
}

function focusAtEnd() {
  input.value?.focus({ preventScroll: true });
  input.value?.setCaretToEnd();
}
</script>

<template>
  <div class="GalleryExample">
    <div class="GalleryExample__grid">
      <DrMaskedInput
        ref="input"
        class="DrMaskedInputGallery__main"
        :model-value="value"
        :mask="activeMask"
        label="Code"
        placeholder="000-000"
        message="Decorative separators stay in the field; the model keeps semantic characters."
        :readonly="props.readonly"
        :disabled="props.disabled"
        @update:model-value="handleUpdate"
        @update:status="handleStatus"
        @blur="handleEvent"
        @keydown="handleEvent"
        @wheel="handleEvent"
      >
        <template #label><span>Code</span></template>

        <template #start="{ inputId }"><span :data-for="inputId">#</span></template>

        <template #end>
          <DrInput
            v-model="plain"
            label="Plain slot"
            :clearable="false"
          />
        </template>
      </DrMaskedInput>

      <DrMaskedInput
        v-model="serial"
        label="Serial"
        :mask="serialMask"
        message="H accepts A–F and 0–9."
      />

      <DrMaskedInput
        v-model="digits"
        label="Digits"
        :mask="digitsMask"
        message="RegExp accepts digits of any length."
      />

      <DrMaskedInput
        v-model="phone"
        label="Phone"
        mask="+{7} (000) 000-00-00"
        message="The semantic literal {7} belongs to the model."
      />

      <DrMaskedInput
        v-model="repeated"
        label="Repeated code"
        :mask="repeatMask"
        message="A digit block repeated up to 30 times."
      />

      <DrMaskedInput
        v-model="dynamic"
        label="Reference"
        :mask="dynamicMask"
        message="Numeric or alphanumeric reference, selected by native dispatch."
      />
    </div>

    <p>Code model: <span data-testid="model">{{ value }}</span>

      · Status: <span data-testid="status">{{ status }}</span></p>

    <p>Serial model: <span data-testid="serial-model">{{ serial }}</span></p>

    <p>Digits model: <span data-testid="digits-model">{{ digits }}</span></p>

    <p>Phone model: <span data-testid="phone-model">{{ phone }}</span></p>

    <p>The model is a string from IMask unmaskedValue.
      Completeness belongs to the mask; application validation is separate.</p>

    <DrButton @click="focusAtEnd">Focus code at end</DrButton>

    <DrButton @click="rerender">Rerender {{ renders }}</DrButton>

    <span
      class="GalleryExample__output"
      data-testid="updates"
    >{{ JSON.stringify(updates) }}</span>

    <span data-testid="event">{{ lastEvent }}</span>
  </div>
</template>
