import type { Component } from 'vue';

export type StoryProps = Record<string, unknown>;
export type StoryModule = { default: Component };
export type MountParams = { story: string; props?: StoryProps };
export type GalleryTheme = 'light' | 'dark';
export type GalleryView = 'gallery' | 'canvas';

export type GalleryStory = { id: string; title: string; description: string };
export type GalleryGroup = { title: string; stories: Array<GalleryStory> };

export type GalleryState = {
  component: Component | null;
  props: StoryProps;
  storyId: string | null;
  error: string | null;
  theme: GalleryTheme;
  view: GalleryView;
};

export type GalleryHostProps = { backgroundRoot: HTMLElement; state: GalleryState };

export type GalleryHostEmits = {
  selectStory: [storyId: string | null];
  changeTheme: [theme: GalleryTheme];
};

export type HostWindow = Window & {
  mount: (params: MountParams) => Promise<void>;
  unmount: () => Promise<void>;
};
