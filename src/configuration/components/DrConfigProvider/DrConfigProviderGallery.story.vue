<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import ConfigExample from '@/configuration/components/DrConfigProvider/ConfigExample.story.vue';
import DrConfigProvider from '@/configuration/components/DrConfigProvider/DrConfigProvider.vue';
import DrToastHost from '@/feedback/toasts/components/DrToastHost/DrToastHost.vue';
import DrFilePickerButton from '@/forms/components/DrFilePickerButton/DrFilePickerButton.vue';
import DrModalHost from '@/overlays/components/DrModalHost/DrModalHost.vue';
import type { DrLanguage, DrLocale, DrTranslateOverride } from '@/configuration/types';

defineOptions({ inheritAttrs: false });

const language = ref<DrLanguage>();
const locale = ref<DrLocale>();
const override = ref(false);
const customClose = ref('Dismiss');
const backgroundRoot = useTemplateRef<HTMLElement>('backgroundRoot');

const translate: DrTranslateOverride = ({ language: currentLanguage, key, params }) => {
  if (key === 'dialog.close') {
    return currentLanguage === 'en' ? customClose.value : 'Закрыть окно';
  }

  if (key === 'input.clearNamed') {
    return `Reset ${params.label}`;
  }

  if (key === 'toast.error') {
    return currentLanguage === 'en' ? 'Custom error' : 'Своя ошибка';
  }

  return undefined;
};

const nestedTranslate: DrTranslateOverride = ({ key }) => key === 'dialog.close' ? 'Готово' : undefined;
</script>

<template>
  <p>Language controls built-in text. Locale controls number grouping and date formats.</p>

  <label>
    Language
    <select v-model="language">
      <option :value="undefined">Automatic</option>

      <option value="en">English</option>

      <option value="ru">Русский</option>
    </select>
  </label>

  <label>
    Locale
    <select v-model="locale">
      <option :value="undefined">Automatic</option>

      <option value="en-US">en-US</option>

      <option value="en-GB">en-GB</option>

      <option value="ru-RU">ru-RU</option>
    </select>
  </label>

  <label>
    <input
      v-model="override"
      type="checkbox"
    />
    Override translations
  </label>

  <label>
    English close message
    <input v-model="customClose" />
  </label>

  <DrConfigProvider
    :language="language"
    :locale="locale"
    :translate="override ? translate : undefined"
  >
    <DrToastHost>
      <DrModalHost :background-root="backgroundRoot">
        <div ref="backgroundRoot">
          <section data-testid="configured">
            <h2>Configured components</h2>

            <ConfigExample />
          </section>

          <section data-testid="nested">
            <h2>Nested provider: Russian and a local close message</h2>

            <DrConfigProvider
              language="ru"
              :translate="nestedTranslate"
            >
              <ConfigExample />
            </DrConfigProvider>
          </section>
        </div>
      </DrModalHost>
    </DrToastHost>
  </DrConfigProvider>

  <section data-testid="providerless">
    <h2>Without a configuration provider</h2>

    <DrFilePickerButton />
  </section>
</template>
