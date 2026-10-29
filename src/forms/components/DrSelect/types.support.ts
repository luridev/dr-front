export type SelectPopupProps = { before?: boolean; after?: boolean; disabled?: boolean };

export type DrSelectGalleryProps = {
  label?: string;
  slotLabel?: string;
  placeholder?: string;
  values?: 'mixed' | 'objects';
  operation?: 'select-first' | 'select-last' | 'clone-model' | 'replace-items';
  response?: 'reject' | 'clone';
};

export type SelectGalleryItem = number | string | { id: number };
