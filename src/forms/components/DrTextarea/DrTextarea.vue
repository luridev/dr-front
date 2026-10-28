<script setup lang="ts">
import { computed, nextTick, useTemplateRef } from 'vue';
import DrButton from '@/actions/components/DrButton/DrButton.vue';
import { useDrTranslation } from '@/configuration/composables/useDrTranslation/useDrTranslation';
import DrControl from '@/forms/components/DrControl/DrControl.vue';
import DrTextareaBase from '@/forms/components/DrTextareaBase/DrTextareaBase.vue';
import DrTextareaPanel from '@/forms/components/DrTextareaPanel/DrTextareaPanel.vue';
import { normalizeMaxLength } from '@/forms/lib/normalizeMaxLength/normalizeMaxLength';
import { resolveClearButtonAriaLabel } from '@/forms/lib/resolveClearButtonAriaLabel/resolveClearButtonAriaLabel';
import type { ControlState } from '@/forms/components/DrControl/types';
import type {
  DrTextareaEmits,
  DrTextareaModelEmits,
  DrTextareaModelProps,
  DrTextareaProps,
  DrTextareaSlots,
} from '@/forms/components/DrTextarea/types';
import type { DrTextareaBaseAria, DrTextareaBaseExposed } from '@/forms/components/DrTextareaBase/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrTextareaProps & DrTextareaModelProps>(), {
  clearable: true,
  disabled: false,
  kind: 'field',
  labelPosition: 'top',
  mode: 'textarea',
  readonly: false,
  spellCheck: undefined,
  state: 'normal',
});

const emit = defineEmits<DrTextareaEmits & DrTextareaModelEmits>();

defineSlots<DrTextareaSlots>();

const t = useDrTranslation();

const model = computed({
  get: () => props.modelValue,
  set: (value: string) => { emit('update:modelValue', value); },
});

const textarea = useTemplateRef<DrTextareaBaseExposed>('textarea');

const maxLength = computed(() => normalizeMaxLength(props.maxLength));
const controlKind = computed(() => (props.mode === 'textarea' ? 'field' : props.kind));

const clearButtonAriaLabel = computed(() =>
  resolveClearButtonAriaLabel(t, props.label, props.aria?.clearButtonAriaLabel),
);

const isClearButtonVisible = computed(
  () => props.clearable && (model.value !== '' || props.mode === 'content') && !props.disabled && !props.readonly,
);

function getTextareaAria(state: ControlState, describedBy?: string): DrTextareaBaseAria {
  return {
    ariaInvalid: props.mode === 'textarea' && state === 'error',
    ariaDescribedBy: props.mode === 'textarea' ? describedBy : undefined,
  };
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event);
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event);
}

function handleLimitExceeded(limit: number): void {
  emit('limitExceeded', limit);
}

function focus(options?: FocusOptions): void {
  void nextTick(() => textarea.value?.focus(options));
}

function handleClear(): void {
  if (props.disabled || props.readonly) {
    return;
  }

  emit('update:modelValue', '');
  focus();
}

defineExpose({
  focus,
});
</script>

<template>
  <DrControl
    :class="$attrs.class"
    :kind="controlKind"
    :label-position="props.labelPosition"
    :disabled="props.disabled"
    :state="props.state"
    :message="props.message"
    bordered
  >
    <template #label>{{ props.label }}</template>

    <template #default="slot">
      <DrTextareaPanel
        :text-length="model.length"
        :max-length="maxLength"
        :show-counter="props.mode === 'textarea'"
      >
        <div class="DrTextarea__content">
          <div
            class="DrTextarea__textarea"
            :class="{
              DrTextarea__textarea_hidden: props.mode === 'content',
            }"
            :aria-hidden="props.mode === 'content' || undefined"
          >
            <DrTextareaBase
              :id="props.mode === 'textarea' ? slot.id : undefined"
              ref="textarea"
              v-model="model"
              :disabled="slot.disabled || props.mode === 'content'"
              :readonly="props.readonly"
              :max-length="maxLength"
              :placeholder="props.placeholder"
              :rows="props.rows"
              :input-mode="props.inputMode"
              :enter-key-hint="props.enterKeyHint"
              :spell-check="props.spellCheck"
              :auto-capitalize="props.autoCapitalize"
              :auto-correct="props.autoCorrect"
              :aria="getTextareaAria(slot.state, slot.describedBy)"
              data-dr-focus-target
              @focus="handleFocus"
              @blur="handleBlur"
              @limit-exceeded="handleLimitExceeded"
            />
          </div>

          <div
            v-if="props.mode === 'content'"
            class="DrTextarea__customContent"
          >
            <slot
              :id="slot.id"
              name="content"
              :label-id="slot.labelId"
              :state="slot.state"
              :disabled="slot.disabled"
              :described-by="slot.describedBy"
            ></slot>
          </div>
        </div>

        <template #actions>
          <slot
            :id="slot.id"
            name="actions"
            :disabled="slot.disabled"
            :readonly="props.readonly"
          ></slot>

          <DrButton
            v-if="isClearButtonVisible"
            variant="ghost"
            size="small"
            :aria="{
              ariaLabel: clearButtonAriaLabel,
            }"
            @pointerdown.prevent
            @click="handleClear"
          >
            {{ t('textarea.clear') }}
          </DrButton>
        </template>
      </DrTextareaPanel>
    </template>
  </DrControl>
</template>

<style scoped>
  .DrTextarea__content {
    display: grid;
    min-width: 0;
  }

  .DrTextarea__textarea,
  .DrTextarea__customContent {
    grid-area: 1 / 1;
    min-width: 0;
  }

  .DrTextarea__textarea_hidden {
    visibility: hidden;
    pointer-events: none;
  }
</style>
