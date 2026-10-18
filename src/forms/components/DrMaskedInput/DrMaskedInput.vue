<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import { provideDrInputMask } from '@/forms/components/DrInput/composables/useDrInputMask/useDrInputMask';
import DrInput from '@/forms/components/DrInput/DrInput.vue';
import { useDrMaskedInputModel } from '@/forms/components/DrMaskedInput/composables/useDrMaskedInputModel/useDrMaskedInputModel';
import { createMaskCodec } from '@/forms/components/DrMaskedInput/lib/maskCodec/maskCodec';
import type { DrInputExposed } from '@/forms/components/DrInput/types';
import type { DrMaskCodec } from '@/forms/components/DrMaskedInput/lib/maskCodec/types';
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
const codec = computed<DrMaskCodec>((previous) => createMaskCodec(props.mask, previous));

const { inputValue, invalidExternal, updateInputValue } = useDrMaskedInputModel({
  model,
  codec,
  onStatusUpdate: (status) => { emit('update:status', status); },
});

provideDrInputMask(computed(() => ({
  maskOptions: invalidExternal.value ? null : codec.value.options,
  inputMode: codec.value.inputMode,
})));

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
