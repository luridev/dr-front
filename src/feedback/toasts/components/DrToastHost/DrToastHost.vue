<script setup lang="ts">
/* eslint-disable vue/no-root-v-if -- Teleport hosts intentionally render nothing before client mount. */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import DrToast from '@/feedback/toasts/components/DrToast/DrToast.vue';
import { activeToast, clearToasts, dismissToast } from '@/feedback/toasts/lib/toastState/toastState';
import { overlayLayers } from '@/overlays/lib/overlayState/overlayState';

defineOptions({
  inheritAttrs: false,
});

const announcement = ref('');

const isHovered = ref(false);
const isFocusWithin = ref(false);
const isDocumentHidden = ref(false);
const isMounted = ref(false);

const isPaused = computed(() => isHovered.value || isFocusWithin.value || isDocumentHidden.value);
const closeButtonTabindex = computed(() => (overlayLayers.value.length > 0 ? -1 : undefined));

let timeoutId: number | undefined;
let remainingDuration = 0;
let timerStartedAt = 0;

function clearTimer() {
  if (timeoutId == null) {
    return;
  }

  window.clearTimeout(timeoutId);
  timeoutId = undefined;
}

function pauseTimer() {
  if (timeoutId == null) {
    return;
  }

  remainingDuration = Math.max(0, remainingDuration - (performance.now() - timerStartedAt));

  clearTimer();
}

function resumeTimer() {
  const currentToast = activeToast.value;

  if (!isMounted.value || currentToast == null || timeoutId != null || isPaused.value) {
    return;
  }

  if (remainingDuration <= 0) {
    dismissToast(currentToast.uid);

    return;
  }

  const toastUid = currentToast.uid;

  timerStartedAt = performance.now();

  timeoutId = window.setTimeout(() => {
    timeoutId = undefined;
    dismissToast(toastUid);
  }, remainingDuration);
}

function handleHoverChange(uid: number, value: boolean) {
  if (activeToast.value?.uid !== uid) {
    return;
  }

  isHovered.value = value;
}

function handleFocusWithinChange(uid: number, value: boolean) {
  if (activeToast.value?.uid !== uid) {
    return;
  }

  isFocusWithin.value = value;
}

function updateDocumentVisibility() {
  isDocumentHidden.value = document.hidden;
}

watch(
  activeToast,
  async (currentToast, previousToast) => {
    clearTimer();

    const hasToastChanged = currentToast?.uid !== previousToast?.uid;

    if (hasToastChanged) {
      isHovered.value = false;
      isFocusWithin.value = false;
      announcement.value = '';
    }

    remainingDuration = currentToast?.duration ?? 0;

    if (currentToast == null) {
      return;
    }

    if (hasToastChanged) {
      await nextTick();

      if (activeToast.value?.uid !== currentToast.uid) {
        return;
      }

      announcement.value = `${currentToast.title}: ${currentToast.message}`;
    }

    resumeTimer();
  },
  {
    immediate: true,
  },
);

watch(isPaused, (paused) => {
  if (paused) {
    pauseTimer();
  } else {
    resumeTimer();
  }
});

onMounted(() => {
  isMounted.value = true;

  updateDocumentVisibility();
  document.addEventListener('visibilitychange', updateDocumentVisibility);

  resumeTimer();
});

onBeforeUnmount(() => {
  isMounted.value = false;

  clearTimer();
  clearToasts();
  document.removeEventListener('visibilitychange', updateDocumentVisibility);
});
</script>

<template>
  <Teleport
    v-if="isMounted"
    to="body"
  >
    <div class="DrToastHost">
      <div
        class="DrToastHost__announcement"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ announcement }}
      </div>

      <Transition
        name="DrToastTransition"
        mode="out-in"
      >
        <DrToast
          v-if="activeToast"
          :key="activeToast.uid"
          :uid="activeToast.uid"
          :variant="activeToast.variant"
          :title="activeToast.title"
          :message="activeToast.message"
          :close-button-tabindex="closeButtonTabindex"
          @close="dismissToast"
          @hover-change="handleHoverChange"
          @focus-within-change="handleFocusWithinChange"
        />
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
  .DrToastHost {
    position: fixed;
    z-index: var(--dr-layer-toast);
    inset-block-start: calc(env(safe-area-inset-top) + var(--dr-space-small));
    inset-inline-start: 50%;
    width: min(36rem, calc(100vw - var(--dr-space-medium) * 2));
    pointer-events: none;
    transform: translateX(-50%);
  }

  .DrToastHost__announcement {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    border: 0;
    white-space: nowrap;
  }

  .DrToastTransition-enter-active,
  .DrToastTransition-leave-active {
    transition:
      opacity 150ms ease,
      transform 150ms ease;
  }

  .DrToastTransition-enter-from,
  .DrToastTransition-leave-to {
    opacity: 0;
    transform: translateY(-0.5rem);
  }

  @media (prefers-reduced-motion: reduce) {
    .DrToastTransition-enter-active,
    .DrToastTransition-leave-active {
      transition: none;
    }
  }
</style>
