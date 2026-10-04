<script setup lang="ts">
import { computed, ref } from 'vue';
import { DrCheckbox, DrInput, DrSection, DrTabPanel, DrTabSwitcher } from '@/index';
import { galleryTabs } from '@/navigation/tabs/components/DrTabSwitcher/config.support';

defineOptions({ inheritAttrs: false });

const current = ref<string>('Overview');
const vertical = ref(false);
const reverseOrder = ref(false);
const projectName = ref('Gallery project');
const orientation = computed(() => (vertical.value ? 'vertical' : 'horizontal'));
const tabs = computed(() => (reverseOrder.value ? [...galleryTabs].reverse() : galleryTabs));
</script>

<template>
  <div class="GalleryExample">
    <DrSection title="Tabs">
      <DrCheckbox
        v-model="vertical"
        label="Vertical"
      />

      <DrCheckbox
        v-model="reverseOrder"
        label="Reverse order"
      />

      <DrTabSwitcher
        id="gallery-tabs"
        v-model="current"
        :items="tabs"
        :orientation="orientation"
        :aria="{ ariaLabel: 'Project sections' }"
      >
        <template #item="slot">{{ slot.item }}</template>
      </DrTabSwitcher>

      <DrTabPanel
        class="GalleryExample__panel"
        switcher-id="gallery-tabs"
        panel-id="Overview"
        :current="current"
      >
        <p>{{ projectName }}</p>
      </DrTabPanel>

      <DrTabPanel
        class="GalleryExample__panel"
        switcher-id="gallery-tabs"
        panel-id="Settings"
        :current="current"
      >
        <DrInput
          v-model="projectName"
          label="Project name"
          :aria="{ clearButtonAriaLabel: 'Clear project name' }"
        />
      </DrTabPanel>

      <DrTabPanel
        class="GalleryExample__panel"
        switcher-id="gallery-tabs"
        panel-id="History"
        :current="current"
      >
        <p>First draft created.</p>
      </DrTabPanel>
    </DrSection>
  </div>
</template>
