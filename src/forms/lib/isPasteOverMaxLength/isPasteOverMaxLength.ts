import { isEmptyString } from '@/strings/lib/isEmptyString/isEmptyString';

export function isPasteOverMaxLength(event: ClipboardEvent, maxLength: number): boolean {
  const pastedText = event.clipboardData?.getData('text/plain');
  const target = event.currentTarget;

  if (pastedText == null
    || isEmptyString(pastedText)
    || !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)
  ) {
    return false;
  }

  const { selectionStart, selectionEnd } = target;

  if (selectionStart == null || selectionEnd == null) {
    return false;
  }

  const selectedTextLength = selectionEnd - selectionStart;

  return target.value.length - selectedTextLength + pastedText.length > maxLength;
}
