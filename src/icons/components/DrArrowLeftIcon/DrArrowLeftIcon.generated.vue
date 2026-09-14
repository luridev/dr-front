<!-- Generated from src/assets/icons/system/arrow-left.svg by generate:icons. Do not edit. -->
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
    class="DrArrowLeftIcon"
    :class="$attrs.class"
    aria-hidden="true"
    focusable="false"
    :width="props.size ?? '1em'"
    :height="props.size ?? '1em'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
  >
    <path
      d="M14 8H2m5-5L2 8l5 5"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
:where(.DrArrowLeftIcon) {
  display: block;
  flex: none;
  color: inherit;
}
</style>
