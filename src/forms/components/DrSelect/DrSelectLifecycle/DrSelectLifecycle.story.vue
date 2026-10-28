<script setup lang="ts">
import { shallowRef, useTemplateRef, watch } from 'vue';
import DrConfigProvider from '@/configuration/components/DrConfigProvider/DrConfigProvider.vue';
import DrFrontProvider from '@/configuration/components/DrFrontProvider/DrFrontProvider.vue';
import DrSelect from '@/forms/components/DrSelect/DrSelect.vue';
import { LocalProvider, SlotContent } from '@/forms/components/DrSelect/DrSelectLifecycle/components.support';
import { lifecycleItems } from '@/forms/components/DrSelect/DrSelectLifecycle/config.support';
import type { DrSelectLifecycleProps } from '@/forms/components/DrSelect/DrSelectLifecycle/types.support';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DrSelectLifecycleProps>(), {
  slot: 'first',
  contextValue: 'provided',
  suffix: 'initial',
  selectedIndex: 0,
  visible: true,
  language: 'ru',
});

const backgroundRoot = useTemplateRef<HTMLElement>('backgroundRoot');
const selected = shallowRef(lifecycleItems[0]);

watch(() => props.selectedIndex, (index) => {
  selected.value = lifecycleItems[index];
});
</script>

<template>
  <div ref="backgroundRoot">
    <DrFrontProvider
      :background-root="backgroundRoot"
      language="en"
    >
      <DrConfigProvider :language="props.language">
        <LocalProvider :value="props.contextValue">
          <DrSelect
            v-show="props.visible"
            v-model="selected"
            label="Context select"
            :items="lifecycleItems"
          >
            <template
              v-if="props.slot === 'first'"
              #item="itemProps"
            >
              <SlotContent
                :details="itemProps"
                variant="first"
                :suffix="props.suffix"
              />
            </template>

            <template
              v-else-if="props.slot === 'second'"
              #item="itemProps"
            >
              <SlotContent
                :details="itemProps"
                variant="second"
                :suffix="props.suffix"
              />
            </template>
          </DrSelect>
        </LocalProvider>
      </DrConfigProvider>
    </DrFrontProvider>
  </div>
</template>
