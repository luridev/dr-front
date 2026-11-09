<!-- Generated from __DR_ICON_SOURCE_PATH__ by generate:icons. Do not edit. -->
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
    class="DrIconTemplateName"
    :class="$attrs.class"
    aria-hidden="true"
    focusable="false"
    :width="props.size ?? '1em'"
    :height="props.size ?? '1em'"
    data-dr-icon-template-attributes=""
  >
    <!-- __DR_ICON_CONTENT__ -->
  </svg>
</template>

<style scoped>
:where(.DrIconTemplateName) {
  display: block;
  flex: none;
  color: inherit;
}
</style>
