<!-- Generated from src/assets/icons/system/chevron-down.svg by generate:icons. Do not edit. -->
<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  size?: number;
}>();
</script>

<template>
  <svg
    class="DrChevronDownIcon"
    :class="$attrs.class"
    aria-hidden="true"
    focusable="false"
    :width="props.size ?? '1em'"
    :height="props.size ?? '1em'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 12 8"
  >
    <path
      d="m1.5 1.5 4.5 4.5 4.5-4.5"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
:where(.DrChevronDownIcon) {
  display: block;
  flex: none;
  color: inherit;
}
</style>
