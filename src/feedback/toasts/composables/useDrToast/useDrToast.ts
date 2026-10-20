import { getCurrentInstance, inject } from 'vue';
import { drToastKey } from '@/feedback/toasts/keys';
import type { DrToastService } from '@/feedback/toasts/types';

export function useDrToast(): DrToastService {
  if (getCurrentInstance() == null) {
    throw new Error('useDrToast() must be called synchronously during setup().');
  }

  const toast = inject(drToastKey, undefined);

  if (toast == null) {
    throw new Error('useDrToast() requires an ancestor <DrToastHost>.');
  }

  return toast;
}
