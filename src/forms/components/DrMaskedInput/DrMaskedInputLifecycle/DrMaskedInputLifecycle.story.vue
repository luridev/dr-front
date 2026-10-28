<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { DrMaskedInput } from '@/index';
import type {
  DrMaskedInputLifecycleProps,
  DrMaskedInputReplacementOptions,
} from '@/forms/components/DrMaskedInput/DrMaskedInputLifecycle/types.support';
import type { DrMask } from '@/forms/components/DrMaskedInput/types';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DrMaskedInputLifecycleProps>(), {
  variant: 'pattern',
  readonly: false,
  disabled: false,
  visible: true,
});

const value = ref('');
const updates = ref<Array<string>>([]);
const renders = ref(0);
const reactiveMask = reactive({ mask: 'num', blocks: { num: { mask: '00-00' } } });

const numberMask = reactive<{ mask: NumberConstructor; scale: number; min?: number }>({
  mask: Number, scale: 0, min: 5,
});

const dynamicMask = reactive({ mask: [{ mask: '00' }] });
const replacementMask = ref<DrMaskedInputReplacementOptions>({ mask: '000-000' });
let prepareCalls = 0;

watch(() => props.externalValue, (next) => {
  if (next !== undefined) {
    value.value = next;
  }
}, { immediate: true });

function prepareChar(input: string): string {
  prepareCalls += 1;

  return input.replace(/[a-y]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 1));
}

function optionsForRender(): DrMask {
  switch (props.variant) {
    case 'nested':
      return { mask: 'num', blocks: { num: { mask: 'HH-00', definitions: { H: /[A-F]/ } } } };
    case 'exposed':
      return { mask: '00:num', blocks: { num: { mask: '00', expose: true } } };
    case 'prepared':
      return { mask: 'aaaa', prepareChar };
    case 'reactive':
      return reactiveMask;
    case 'number':
      return numberMask;
    case 'dynamic':
      return dynamicMask;
    case 'replacement':
      return replacementMask.value;
    case 'pattern':
      return { mask: '000-000' };
  }
}

function handleUpdate(next: string) {
  updates.value.push(next);
  value.value = next;
}

function rerender() {
  renders.value += 1;
}

function changePattern() {
  reactiveMask.mask = '0000';
}

function changeBlock() {
  reactiveMask.blocks.num.mask = '0000';
}

function removeMinimum() {
  delete numberMask.min;
}

function addDynamicBranch() {
  dynamicMask.mask.push({ mask: '000' });
}

function limitLength(length: number) {
  replacementMask.value = { mask: '0000', validate: (input) => input.length <= length };
}

function limitTwo() {
  limitLength(2);
}

function limitFour() {
  limitLength(4);
}

function replacePattern() {
  replacementMask.value = { mask: '0000' };
}

function replaceNumber() {
  replacementMask.value = { mask: Number, scale: 0, max: 99 };
}

function replaceOptionsAndValue() {
  replacementMask.value = { mask: '00/00' };
  value.value = '98765';
}
</script>

<template>
  <div class="GalleryExample">
    <DrMaskedInput
      v-if="props.visible"
      :model-value="value"
      :mask="optionsForRender()"
      label="Lifecycle code"
      :readonly="props.readonly"
      :disabled="props.disabled"
      @update:model-value="handleUpdate"
    />

    <button
      type="button"
      @pointerdown.prevent
      @click="rerender"
    >Rerender {{ renders }}</button>

    <template v-if="props.variant === 'reactive'">
      <button
        type="button"
        @pointerdown.prevent
        @click="changePattern"
      >Change reactive pattern</button>

      <button
        type="button"
        @pointerdown.prevent
        @click="changeBlock"
      >Change reactive block</button>
    </template>

    <button
      v-if="props.variant === 'number'"
      type="button"
      @pointerdown.prevent
      @click="removeMinimum"
    >Remove minimum</button>

    <button
      v-if="props.variant === 'dynamic'"
      type="button"
      @pointerdown.prevent
      @click="addDynamicBranch"
    >Add dynamic branch</button>

    <template v-if="props.variant === 'replacement'">
      <button
        type="button"
        @pointerdown.prevent
        @click="limitTwo"
      >Limit two</button>

      <button
        type="button"
        @pointerdown.prevent
        @click="limitFour"
      >Limit four</button>

      <button
        type="button"
        @pointerdown.prevent
        @click="replacePattern"
      >Replace pattern</button>

      <button
        type="button"
        @pointerdown.prevent
        @click="replaceNumber"
      >Replace number</button>

      <button
        type="button"
        @pointerdown.prevent
        @click="replaceOptionsAndValue"
      >Replace options and value</button>
    </template>

    <p data-testid="model">{{ value }}</p>

    <p data-testid="updates">{{ JSON.stringify(updates) }}</p>

    <p data-testid="prepare-calls">{{ prepareCalls }}</p>
  </div>
</template>
