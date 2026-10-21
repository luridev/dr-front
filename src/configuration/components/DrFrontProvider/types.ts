import type { DrConfigProviderProps } from '@/configuration/types';
import type { DrModalHostProps } from '@/overlays/components/DrModalHost/types';

export type DrFrontProviderProps = DrConfigProviderProps & Partial<DrModalHostProps>;
