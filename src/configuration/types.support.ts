import { ru } from '@/configuration/messages/ru';
import type { DrMessages, DrTranslate } from '@/configuration/types';

const russian: DrMessages = ru;

export function translationTypeContracts(t: DrTranslate) {
  t('dialog.close');
  t('input.clearNamed', { label: 'Email' });
  // @ts-expect-error Messages without parameters take no arguments.
  t('dialog.close', { label: 'Email' });
  // @ts-expect-error Parameters are required for named messages.
  t('input.clearNamed');
  // @ts-expect-error Parameter values must be strings.
  t('input.clearNamed', { label: 123 });
  // @ts-expect-error Parameter names follow the English function signature.
  t('input.clearNamed', { name: 'Email' });
  // @ts-expect-error Extra parameter names are rejected.
  t('input.clearNamed', { label: 'Email', extra: 'value' });
  // @ts-expect-error Extra arguments are rejected.
  t('input.clearNamed', { label: 'Email' }, 'extra');
  // @ts-expect-error Unknown keys are rejected.
  t('unknown.key');

  return russian;
}
