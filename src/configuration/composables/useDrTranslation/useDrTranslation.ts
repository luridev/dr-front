import { useDrConfig } from '@/configuration/composables/useDrConfig/useDrConfig';
import { createTranslator } from '@/configuration/lib/createTranslator/createTranslator';

export function useDrTranslation() {
  return createTranslator(useDrConfig());
}
