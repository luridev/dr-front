export type SelectCollectionOperation = 'reverse' | 'splice' | 'replace' | 'add' | 'clear' | 'restore';

export type SelectCollectionsProps = {
  operation?: SelectCollectionOperation;
};

export type SelectCollectionItem = {
  id: number;
  label: string;
};
