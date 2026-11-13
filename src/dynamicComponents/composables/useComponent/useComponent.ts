import type { DrComponentDefinition } from '@/dynamicComponents/types';

export function useComponent<const TDefinition extends DrComponentDefinition>(definition: TDefinition): TDefinition {
  return definition;
}
