import MaskedNumber from 'imask/masked/number';
import { integerInputParams } from '@/forms/lib/inputFormats/integer/config';

export class DraftIntegerMask extends MaskedNumber {
  override get unmaskedValue(): string {
    return this.value.replaceAll(integerInputParams.thousandSeparator, '');
  }

  override set unmaskedValue(value: string) {
    super.unmaskedValue = value;
  }
}
