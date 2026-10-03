<script setup lang="ts">
import { ref } from 'vue';
import { DrButton, DrCheckbox, DrExpandableSection, DrGrid, DrGridItem, DrInput, DrSection } from '@/index';

defineOptions({ inheritAttrs: false });

const adaptive = ref(true);
const expandedDisabled = ref(false);
const title = ref('My project');
const author = ref('Alex');
const note = ref('Ready for review.');

function handleReset() {
  title.value = 'My project';
  author.value = 'Alex';
  note.value = 'Ready for review.';
}
</script>

<template>
  <div class="GalleryExample">
    <DrSection title="Section and grid">
      <template #actions>
        <DrButton
          size="small"
          @click="handleReset"
        >Reset</DrButton>
      </template>

      <DrCheckbox
        v-model="adaptive"
        label="Adaptive grid"
      />

      <DrGrid
        :columns="2"
        :adaptive="adaptive"
        align="top"
      >
        <DrGridItem>
          <DrInput
            v-model="title"
            label="Name"
            :aria="{ clearButtonAriaLabel: 'Clear name' }"
          />
        </DrGridItem>

        <DrGridItem>
          <DrInput
            v-model="author"
            label="Author"
            :aria="{ clearButtonAriaLabel: 'Clear author' }"
          />
        </DrGridItem>

        <DrGridItem span>
          <DrInput
            v-model="note"
            label="Note"
            :aria="{ clearButtonAriaLabel: 'Clear note' }"
          />
        </DrGridItem>

        <DrGridItem justify="left"><span class="GalleryExample__panel">Left</span></DrGridItem>

        <DrGridItem justify="right"><span class="GalleryExample__panel">Right</span></DrGridItem>
      </DrGrid>
    </DrSection>

    <DrSection title="Expandable section">
      <DrCheckbox
        v-model="expandedDisabled"
        label="Disabled"
      />

      <DrExpandableSection
        title="More options"
        :disabled="expandedDisabled"
      >
        <template #params>
          <DrButton
            size="small"
            @click="handleReset"
          >Reset</DrButton>
        </template>

        <DrInput
          v-model="note"
          label="Note"
          :aria="{ clearButtonAriaLabel: 'Clear note' }"
        />
      </DrExpandableSection>
    </DrSection>
  </div>
</template>
