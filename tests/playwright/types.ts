import type {
  Locator,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  TestType,
} from '@playwright/test';
import type { FactoryOpts, HTMLInputMaskElement, InputMask } from 'imask';
import type { StoryProps } from '~/gallery/types';

export type { HostWindow, MountParams, StoryProps } from '~/gallery/types';

export type MountedStory = Locator & {
  update: (props?: StoryProps) => Promise<void>;
  unmount: () => Promise<void>;
};

export type ComponentTestArgs = Omit<PlaywrightTestArgs, 'mount'> & {
  mount: (storyId: string, props?: StoryProps) => Promise<MountedStory>;
};

export type ComponentTest = TestType<
  ComponentTestArgs & PlaywrightTestOptions,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
>;

// Temporary, test-only instrumentation. Never exposed by the component API.
export type DiagnosticMask = InputMask<FactoryOpts> & { el: HTMLInputMaskElement };
export type MaskDiagnosticRecord = Record<string, unknown>;

export type MaskDiagnosticWindow = Window & {
  __drMaskDiagnostic: {
    records: Array<MaskDiagnosticRecord>;
    readVue?: () => unknown;
    record: (phase: string, input?: HTMLInputElement, detail?: MaskDiagnosticRecord) => void;
    track: (control: DiagnosticMask, source: string) => void;
  };
};
