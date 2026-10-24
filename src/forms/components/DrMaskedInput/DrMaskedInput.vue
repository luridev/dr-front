<script setup lang="ts">
import { toRef, useTemplateRef } from 'vue';
import { provideDrInputEditor } from '@/forms/components/DrInput/composables/useDrInputEditor/useDrInputEditor';
import DrInput from '@/forms/components/DrInput/DrInput.vue';
import { useDrMaskedInputEditor } from '@/forms/components/DrMaskedInput/composables/useDrMaskedInputEditor/useDrMaskedInputEditor';
import { useDrMaskedInputModel } from '@/forms/components/DrMaskedInput/composables/useDrMaskedInputModel/useDrMaskedInputModel';
import type { DrInputExposed } from '@/forms/components/DrInput/types';
import type { DrMaskedInputEmits, DrMaskedInputProps, DrMaskedInputSlots } from '@/forms/components/DrMaskedInput/types';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DrMaskedInputProps>(), {
  clearable: true,
  disabled: false,
  readonly: false,
  state: 'normal',
});

const emit = defineEmits<DrMaskedInputEmits>();
const model = defineModel<string>({ required: true });
defineSlots<DrMaskedInputSlots>();
const input = useTemplateRef<DrInputExposed>('input');

const { options: maskOptions, masked, inputValue, accept, updateInputValue } = useDrMaskedInputModel({
  model,
  mask: toRef(props, 'mask'),
  onStatusUpdate: (status) => { emit('update:status', status); },
});

provideDrInputEditor(({ input: inputElement, readonly }) => useDrMaskedInputEditor({
  input: inputElement,
  readonly,
  options: maskOptions,
  masked,
  inputValue,
  accept,
}));

function handleBlur(event: FocusEvent) {
  emit('blur', event);
}

function handleKeydown(event: KeyboardEvent) {
  emit('keydown', event);
}

function handleWheel(event: WheelEvent) {
  emit('wheel', event);
}

defineExpose({
  focus: (options?: FocusOptions) => input.value?.focus(options),
  setCaretToEnd: () => input.value?.setCaretToEnd(),
});
</script>

<template>
  <DrInput
    ref="input"
    :class="$attrs.class"
    type="text"
    :model-value="inputValue"
    :label="props.label"
    :label-position="props.labelPosition"
    :placeholder="props.placeholder"
    :clearable="props.clearable"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :state="props.state"
    :message="props.message"
    :autocomplete="props.autocomplete"
    :aria="props.aria"
    @update:model-value="updateInputValue"
    @blur="handleBlur"
    @keydown="handleKeydown"
    @wheel="handleWheel"
  >
    <template #label>
      <slot name="label">{{ props.label }}</slot>
    </template>

    <template #start="{ inputId }">
      <slot
        name="start"
        :input-id="inputId"
      ></slot>
    </template>

    <template #end="{ inputId }">
      <slot
        name="end"
        :input-id="inputId"
      ></slot>
    </template>
  </DrInput>
</template>
