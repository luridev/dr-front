<!-- Generated from src/assets/icons/system/plus-minus.svg by generate:icons. Do not edit. -->
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
    class="DrPlusMinusIcon"
    :class="$attrs.class"
    aria-hidden="true"
    focusable="false"
    :width="props.size ?? '1em'"
    :height="props.size ?? '1em'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
  >
    <path
      d="M8 2.5v6M5 5.5h6M5 12.5h6"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
:where(.DrPlusMinusIcon) {
  display: block;
  flex: none;
  color: inherit;
}
</style>
