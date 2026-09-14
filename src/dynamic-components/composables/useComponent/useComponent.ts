import type { DrComponentDefinition } from '@/dynamic-components/types';

export function useComponent<const TDefinition extends DrComponentDefinition>(definition: TDefinition): TDefinition {
  return definition;
}
