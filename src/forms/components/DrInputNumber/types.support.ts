import type { DrInputNumberProps } from '@/forms/components/DrInputNumber/types';

export type DrInputNumberGalleryProps = Pick<DrInputNumberProps, 'min' | 'max' | 'state'> & {
  externalAmount?: number | null;
};
