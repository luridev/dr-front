<!-- Generated from src/assets/icons/system/check.svg by generate:icons. Do not edit. -->
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
    class="DrCheckIcon"
    :class="$attrs.class"
    aria-hidden="true"
    focusable="false"
    :width="props.size ?? '1em'"
    :height="props.size ?? '1em'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
  >
    <path
      d="m3 8.5 3 3 7-7"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
:where(.DrCheckIcon) {
  display: block;
  flex: none;
  color: inherit;
}
</style>
