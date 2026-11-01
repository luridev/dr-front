<script setup lang="ts">
import { ref } from 'vue';
import { focusRingCases } from '@/actions/components/DrButton/DrButtonFocusRing/config.support';
import { DrButton, DrInput } from '@/index';
import type { DrButtonFocusRingProps } from '@/actions/components/DrButton/DrButtonFocusRing/types.support';

defineOptions({ inheritAttrs: false });

const props = defineProps<DrButtonFocusRingProps>();
const query = ref('query');
const clicks = ref(0);

function handleClick() {
  clicks.value += 1;
}
</script>

<template>
  <div class="GalleryExample DrButtonFocusRing">
    <p>
      Inside rings fit buttons placed against a clipped field edge.
      Other slot content reserves space for its own outline.
    </p>

    <div
      class="GalleryExample__row"
      data-testid="switching"
    >
      <button type="button">Before</button>

      <DrButton
        :focus-ring="props.focusRing"
        @click="handleClick"
      >Action</DrButton>

      <button type="button">After</button>

      <DrButton>Default reference</DrButton>
    </div>

    <p data-testid="clicks">{{ clicks }}</p>

    <div class="DrButtonFocusRing__fields">
      <DrInput
        v-for="item in focusRingCases"
        :key="item.name"
        v-model="query"
        :label="item.name"
        :clearable="false"
        message="Helper text"
      >
        <template #[item.side]>
          <DrButton
            :state="item.state"
            :variant="item.variant"
            size="small"
            focus-ring="inside"
          >{{ item.name }}</DrButton>
        </template>
      </DrInput>

      <DrInput
        v-model="query"
        label="Native action field"
        :clearable="false"
      >
        <template #end>
          <button
            class="DrButtonFocusRing__native"
            type="button"
          >Native action</button>
        </template>
      </DrInput>

      <DrInput
        v-model="query"
        label="Link field"
        :clearable="false"
      >
        <template #start>
          <a
            class="DrButtonFocusRing__native"
            href="#focus-ring-note"
          >Slot link</a>
        </template>
      </DrInput>

      <DrInput
        v-model="query"
        label="Native editor field"
        :clearable="false"
      >
        <template #end>
          <input
            class="DrButtonFocusRing__native DrButtonFocusRing__editor"
            aria-label="Slot editor"
            value="Editable"
          />
        </template>
      </DrInput>
    </div>

    <p id="focus-ring-note">The placement does not change Tab navigation or keyboard activation.</p>
  </div>
</template>

<style scoped>
  .DrButtonFocusRing__fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 320px));
    align-items: start;
    gap: var(--dr-space-medium);
  }

  .DrButtonFocusRing__native {
    margin: var(--dr-space-small);
  }

  .DrButtonFocusRing__editor {
    width: 64px;
    min-width: 0;
  }
</style>
