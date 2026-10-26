<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef } from 'vue';
import { mountBareSelect, mountScope } from '@/overlays/components/DrModalHost/HostScopes/HostScopes.support';
import type { App } from 'vue';
import type { ScopeRegistry } from '@/overlays/components/DrModalHost/HostScopes/types.support';

defineOptions({ inheritAttrs: false });

const registry: ScopeRegistry = new Map();
const rootA = useTemplateRef<HTMLElement>('rootA');
const rootB = useTemplateRef<HTMLElement>('rootB');
const bare = useTemplateRef<HTMLElement>('bare');
const ownerMounted = ref(true);
const sharedBackground = shallowRef<HTMLElement | null>(null);
const result = ref<number>();
const error = ref('');
let appA: App | undefined;
let appB: App | undefined;
let bareApp: App | undefined;

function mountA() {
  if (appA == null && rootA.value != null) {
    appA = mountScope({ name: 'a', root: rootA.value, registry, ownerMounted, sharedBackground });
  }
}

function unmountA() {
  appA?.unmount();
  appA = undefined;
}

function notify(name: string, message = name, duration = 1000) {
  result.value = registry.get(name)?.toast.info({ message, duration });
}

onMounted(() => {
  mountA();

  if (rootB.value != null) {
    appB = mountScope({ name: 'b', root: rootB.value, registry, ownerMounted: ref(true), sharedBackground });
  }

  if (bare.value != null) {
    bareApp = mountBareSelect(bare.value, (message) => {
      error.value = message;
    });
  }
});

onBeforeUnmount(() => {
  unmountA();
  appB?.unmount();
  bareApp?.unmount();
});

const actions = [
  { label: 'Toast a', run: () => { notify('a'); } },
  { label: 'Queue a', run: () => { notify('a', 'queued'); } },
  { label: 'Toast nested', run: () => { notify('a-nested'); } },
  { label: 'Toast b', run: () => { notify('b', 'b', 30000); } },
  { label: 'Open a', run: (event: MouseEvent) => registry.get('a')?.dialog.open(undefined, { opener: event.currentTarget as HTMLElement }) },
  { label: 'Open nested', run: (event: MouseEvent) => registry.get('a-nested')?.dialog.open(undefined, { opener: event.currentTarget as HTMLElement }) },
  { label: 'Open b', run: (event: MouseEvent) => registry.get('b')?.dialog.open(undefined, { opener: event.currentTarget as HTMLElement }) },
  { label: 'Close a', run: () => registry.get('a')?.dialog.close() },
  { label: 'Close b', run: () => registry.get('b')?.dialog.close() },
  { label: 'Unmount a', run: unmountA },
  { label: 'Mount a', run: mountA },
  { label: 'Toggle owner',
    run: () => {
      ownerMounted.value = !ownerMounted.value;
    } },
  { label: 'Share background',
    run: () => {
      sharedBackground.value = rootA.value;
    } },
  { label: 'Separate backgrounds',
    run: () => {
      sharedBackground.value = null;
    } },
];
</script>

<template>
  <div>
    <button
      v-for="action in actions"
      :key="action.label"
      @click="action.run"
    >{{ action.label }}</button>

    <span data-testid="result">{{ result }}</span>

    <span data-testid="error">{{ error }}</span>
  </div>

  <div
    ref="rootA"
    data-testid="root-a"
  ></div>

  <div
    ref="rootB"
    data-testid="root-b"
  ></div>

  <div ref="bare"></div>
</template>
