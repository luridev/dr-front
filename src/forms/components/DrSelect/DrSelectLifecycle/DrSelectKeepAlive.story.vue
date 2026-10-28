<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import { CachedSelectOwner } from '@/forms/components/DrSelect/DrSelectLifecycle/components.support';
import DrModalHost from '@/overlays/components/DrModalHost/DrModalHost.vue';
import type { DrSelectKeepAliveProps } from '@/forms/components/DrSelect/DrSelectLifecycle/types.support';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DrSelectKeepAliveProps>(), {
  scope: 'owner',
  active: true,
  secondary: false,
});

const primaryBackground = useTemplateRef<HTMLElement>('primaryBackground');
const secondaryBackground = useTemplateRef<HTMLElement>('secondaryBackground');
const deactivations = ref(0);

function handleDeactivated() {
  deactivations.value += 1;
}
</script>

<template>
  <div
    ref="primaryBackground"
    data-testid="primary-background"
  >
    <DrModalHost
      v-if="props.scope === 'owner'"
      :background-root="primaryBackground"
    >
      <KeepAlive>
        <CachedSelectOwner
          v-if="props.active"
          label="Cached select"
          @deactivated="handleDeactivated"
        />
      </KeepAlive>
    </DrModalHost>

    <KeepAlive v-else>
      <DrModalHost
        v-if="props.active"
        :background-root="primaryBackground"
      >
        <CachedSelectOwner
          label="Cached select"
          @deactivated="handleDeactivated"
        />
      </DrModalHost>
    </KeepAlive>
  </div>

  <div
    v-if="props.secondary"
    ref="secondaryBackground"
    data-testid="secondary-background"
  >
    <DrModalHost :background-root="secondaryBackground">
      <CachedSelectOwner label="Other select" />
    </DrModalHost>
  </div>

  <button type="button">Outside focus</button>

  <p data-testid="deactivations">{{ deactivations }}</p>
</template>
