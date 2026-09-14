import type { SpawnSyncReturns } from 'node:child_process';

export type PackageManifest = {
  name: string;
  dependencies: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies?: Record<string, string>;
  exports: Record<string, unknown>;
  sideEffects: boolean | Array<string>;
};

export type NpmPackResult = {
  filename: string;
  files: Array<{ path: string }>;
};

export type RunNpmOptions = {
  cwd: string;
  captureStdout?: boolean;
};

export type NpmRunResult = SpawnSyncReturns<string | null>;
