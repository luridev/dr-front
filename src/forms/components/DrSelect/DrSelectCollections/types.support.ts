export type SelectCollectionOperation = 'reverse' | 'sort' | 'splice' | 'replace' | 'add' | 'remove';

export type SelectCollectionsProps = {
  operation?: SelectCollectionOperation;
};

export type SelectCollectionItem = {
  id: number;
  label: string;
};
