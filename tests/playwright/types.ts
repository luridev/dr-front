import type {
  Locator,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  TestType,
} from '@playwright/test';
import type { Component } from 'vue';

export type StoryProps = Record<string, unknown>;
export type StoryModule = { default: Component };
export type MountParams = { story: string; props?: StoryProps };
export type HostState = { component: Component | null; props: StoryProps };
export type HostProps = { backgroundRoot: HTMLElement; state: HostState };
export type HostWindow = Window & { mount: (params: MountParams) => Promise<void> };

export type MountedStory = Locator & { update: (props?: StoryProps) => Promise<void> };

export type ComponentTestArgs = Omit<PlaywrightTestArgs, 'mount'> & {
  mount: (storyId: string, props?: StoryProps) => Promise<MountedStory>;
};

export type ComponentTest = TestType<
  ComponentTestArgs & PlaywrightTestOptions,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
>;
