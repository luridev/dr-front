<!-- Generated from src/assets/icons/system/close.svg by generate:icons. Do not edit. -->
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
    class="DrCloseIcon"
    :class="$attrs.class"
    aria-hidden="true"
    focusable="false"
    :width="props.size ?? '1em'"
    :height="props.size ?? '1em'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
  >
    <path
      d="M6 6 18 18M18 6 6 18"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
:where(.DrCloseIcon) {
  display: block;
  flex: none;
  color: inherit;
}
</style>
