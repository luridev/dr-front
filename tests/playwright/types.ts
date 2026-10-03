import type {
  Locator,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  TestType,
} from '@playwright/test';
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
