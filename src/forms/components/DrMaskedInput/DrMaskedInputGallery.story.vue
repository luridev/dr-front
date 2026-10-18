<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue';
import { integerMask, serialMask } from '@/forms/components/DrMaskedInput/config.support';
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
const integer = ref('1234567');
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
        :mask="props.mask"
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
        v-model="integer"
        label="Integer"
        :mask="integerMask"
        message="Arbitrary precision. Leading zeros and negative zero normalize only in the model."
      />

      <DrMaskedInput
        v-model="phone"
        label="Phone"
        mask="+{7} (000) 000-00-00"
        message="The semantic literal {7} belongs to the model."
      />
    </div>

    <p>Code model: <span data-testid="model">{{ value }}</span>

      · Status: <span data-testid="status">{{ status }}</span></p>

    <p>Serial model: <span data-testid="serial-model">{{ serial }}</span></p>

    <p>Integer model: <span data-testid="integer-model">{{ integer }}</span></p>

    <p>Phone model: <span data-testid="phone-model">{{ phone }}</span></p>

    <p>A partial pattern publishes its partial string. A lone minus keeps an incomplete draft with an empty model.</p>

    <DrButton @click="focusAtEnd">Focus code at end</DrButton>

    <span data-testid="updates">{{ JSON.stringify(updates) }}</span>

    <span data-testid="event">{{ lastEvent }}</span>
  </div>
</template>
