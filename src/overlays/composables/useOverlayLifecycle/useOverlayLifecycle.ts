import { getCurrentInstance, onActivated, onDeactivated, onScopeDispose, readonly, ref } from 'vue';

export function useOverlayLifecycle(close: () => void) {
  const isActive = ref(true);
  let disposed = false;

  function deactivate() {
    isActive.value = false;
    close();
  }

  if (getCurrentInstance() != null) {
    onDeactivated(deactivate);

    onActivated(() => {
      if (!disposed) {
        isActive.value = true;
      }
    });
  }

  onScopeDispose(() => {
    disposed = true;
    deactivate();
  });

  return readonly(isActive);
}
