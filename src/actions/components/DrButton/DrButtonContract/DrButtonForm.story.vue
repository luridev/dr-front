<script setup lang="ts">
import { ref } from 'vue';
import { DrButton } from '@/index';
import type { DrButtonFormProps } from '@/actions/components/DrButton/DrButtonContract/types.support';

defineOptions({ inheritAttrs: false });

const props = defineProps<DrButtonFormProps>();
const clicks = ref(0);
const submissions = ref(0);

function handleClick(): void {
  clicks.value += 1;
}

function handleSubmit(): void {
  submissions.value += 1;
}
</script>

<template>
  <form
    id="button-contract-form"
    @submit.prevent="handleSubmit"
  >
    <label>
      First field
      <input type="text" />
    </label>

    <!-- Two fields prevent implicit submission from masking a missing submit button. -->
    <label>
      Second field
      <input type="text" />
    </label>

    <DrButton
      v-if="!props.outside"
      type="submit"
      :disabled="props.disabled"
      :loading="props.loading"
      @click="handleClick"
    >
      Submit
    </DrButton>
  </form>

  <DrButton
    v-if="props.outside"
    type="submit"
    form="button-contract-form"
    :disabled="props.disabled"
    :loading="props.loading"
    @click="handleClick"
  >
    Submit
  </DrButton>

  <p data-testid="clicks">{{ clicks }}</p>

  <p data-testid="submissions">{{ submissions }}</p>
</template>
