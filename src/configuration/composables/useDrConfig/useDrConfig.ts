import { getCurrentInstance, inject } from 'vue';
import { defaultConfig } from '@/configuration/config';
import { drConfigKey } from '@/configuration/keys';

export function useDrConfig() {
  return getCurrentInstance() == null ? defaultConfig : inject(drConfigKey, defaultConfig);
}
