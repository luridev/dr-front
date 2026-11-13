export type PackageManifest = {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies?: Record<string, string>;
  exports: Record<string, unknown>;
  sideEffects: boolean | Array<string>;
};

export type PackageLock = {
  packages: Record<string, unknown>;
};
