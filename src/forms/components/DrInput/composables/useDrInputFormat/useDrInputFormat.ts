import { computed, toValue } from 'vue';
import {
  defaultDrInputFormatSettings,
  inputFormatSettings,
} from '@/forms/components/DrInput/composables/useDrInputFormat/config';
import { useDrInputInternalFormat } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/useDrInputInternalFormat';
import type { UseDrInputFormatParams } from '@/forms/components/DrInput/composables/useDrInputFormat/types';
import type { DrInputInternalFormat } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/types';
import type { DrInputFormat } from '@/forms/lib/inputFormats/types';

function resolveInputFormatSettings(
  inputFormat: DrInputFormat | undefined,
): DrInputInternalFormat {
  if (inputFormat == null) {
    return defaultDrInputFormatSettings;
  }

  return inputFormatSettings[inputFormat.type];
}

export function useDrInputFormat({ inputFormat }: UseDrInputFormatParams) {
  const internalFormat = useDrInputInternalFormat();
  const settings = computed(() => internalFormat.value ?? resolveInputFormatSettings(toValue(inputFormat)));
  const maskitoOptions = computed(() => settings.value.maskitoOptions);
  const inputMode = computed(() => settings.value.inputMode);

  return {
    maskitoOptions,
    inputMode,
  };
}
