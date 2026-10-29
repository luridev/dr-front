export type RadioGroupGalleryItem = number | string | { id: number };

export type RadioGroupCheckedSlot = {
  checked: boolean;
};

export type DrRadioGroupGalleryProps = {
  values?: 'mixed' | 'objects';
  response?: 'accept' | 'reject' | 'clone' | 'reverse' | 'unmount';
  operation?: 'clone-model' | 'replace-items' | 'select-first' | 'select-last-async';
};
