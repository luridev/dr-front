<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import DrConfigProvider from '@/configuration/components/DrConfigProvider/DrConfigProvider.vue';
import DrFrontProvider from '@/configuration/components/DrFrontProvider/DrFrontProvider.vue';
import ProviderContent from '@/configuration/components/DrFrontProvider/ProviderContent.story.vue';
import type { DrFrontProviderGalleryProps } from '@/configuration/components/DrFrontProvider/types.support';
import type { DrLanguage } from '@/configuration/types';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DrFrontProviderGalleryProps>(), {
  ready: true,
  mounted: true,
  multiple: false,
});

const language = ref<DrLanguage>();
const primaryRoot = useTemplateRef<HTMLElement>('primaryRoot');
const secondaryRoot = useTemplateRef<HTMLElement>('secondaryRoot');
</script>

<template>
  <label>
    Language
    <select v-model="language">
      <option :value="undefined">Default</option>

      <option value="ru">Русский</option>

      <option value="en">English</option>
    </select>
  </label>

  <DrConfigProvider :locale="props.locale">
    <DrFrontProvider
      v-if="props.mounted"
      :language="language"
      :background-root="props.ready ? primaryRoot : null"
    >
      <section
        ref="primaryRoot"
        data-testid="primary"
      >
        <ProviderContent name="Primary" />
      </section>
    </DrFrontProvider>

    <DrFrontProvider
      v-if="props.multiple"
      :background-root="secondaryRoot"
    >
      <section
        ref="secondaryRoot"
        data-testid="secondary"
      >
        <ProviderContent name="Secondary" />
      </section>
    </DrFrontProvider>
  </DrConfigProvider>
</template>
