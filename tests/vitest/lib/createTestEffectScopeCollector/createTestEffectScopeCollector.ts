import { afterEach } from 'vitest';
import { effectScope } from 'vue';
import type { EffectScope } from 'vue';

export function createTestEffectScopeCollector() {
  const scopes = new Set<EffectScope>();

  function run<T>(setup: () => T): T {
    const scope = effectScope();

    scopes.add(scope);

    try {
      return scope.run(setup) as T;
    } catch (error) {
      scope.stop();
      scopes.delete(scope);
      throw error;
    }
  }

  function stopAll(): void {
    for (const scope of scopes) {
      scope.stop();
    }

    scopes.clear();
  }

  afterEach(stopAll);

  return {
    run,
    stopAll,
  };
}
