import 'temporal-polyfill/global';
import { createApp, nextTick, shallowReactive } from 'vue';
import '@/styles/index.css';
import '~/gallery/styles.css';
import { clearToasts } from '@/feedback/toasts/lib/toastState/toastState';
import GalleryHost from '~/gallery/GalleryHost.vue';
import type { GalleryState, GalleryTheme, HostWindow, MountParams, StoryModule, StoryProps } from '~/gallery/types';

const stories = import.meta.glob<StoryModule | undefined>('../src/**/*.story.vue', { eager: true });
const backgroundRoot = document.getElementById('gallery');

if (backgroundRoot == null) {
  throw new Error('Gallery root is missing.');
}

const state = shallowReactive<GalleryState>({
  component: null,
  props: {},
  storyId: null,
  error: null,
  theme: 'light',
  view: 'gallery',
});

function applyTheme(theme: GalleryTheme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
}

async function clearStory(): Promise<void> {
  state.component = null;
  state.props = {};
  state.storyId = null;
  state.error = null;
  await nextTick();
  clearToasts();
  await nextTick();
}

async function renderStory(storyId: string | null, props: StoryProps = {}): Promise<void> {
  if (storyId === null) {
    await clearStory();

    return;
  }

  if (state.storyId !== storyId) {
    await clearStory();
  }

  const module = stories[`../src/${storyId}.story.vue`];

  state.storyId = storyId;
  state.error = module == null ? `Unknown story: ${storyId}` : null;
  state.component = module?.default ?? null;
  state.props = props;
  await nextTick();
}

function updateStoryURL(storyId: string | null, method: 'pushState' | 'replaceState') {
  const url = new URL(window.location.href);

  if (storyId === null) {
    url.searchParams.delete('story');
  } else {
    url.searchParams.set('story', storyId);
  }

  window.history[method](window.history.state, '', url);
}

async function selectStory(storyId: string | null): Promise<void> {
  updateStoryURL(storyId, 'pushState');
  await renderStory(storyId);
  window.scrollTo(0, 0);
}

function changeTheme(theme: GalleryTheme) {
  const url = new URL(window.location.href);

  url.searchParams.set('theme', theme);
  window.history.replaceState(window.history.state, '', url);
  applyTheme(theme);
}

async function syncWithURL(): Promise<void> {
  const params = new URL(window.location.href).searchParams;
  const theme = params.get('theme');

  state.view = params.get('view') === 'canvas' ? 'canvas' : 'gallery';

  applyTheme(theme === 'dark' || theme === 'light'
    ? theme
    : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  await renderStory(params.get('story'));
}

async function mount({ story, props }: MountParams): Promise<void> {
  if (stories[`../src/${story}.story.vue`] == null) {
    throw new Error(`Unknown component story: ${story}`);
  }

  updateStoryURL(story, 'replaceState');
  await renderStory(story, props);
}

async function unmount(): Promise<void> {
  updateStoryURL(null, 'replaceState');
  await clearStory();
}

createApp(GalleryHost, {
  backgroundRoot,
  state,
  onSelectStory: selectStory,
  onChangeTheme: changeTheme,
}).mount(backgroundRoot);

window.addEventListener('popstate', () => {
  void syncWithURL();
});

await syncWithURL();
Object.assign(window as unknown as HostWindow, { mount, unmount });
document.documentElement.dataset.hostReady = 'true';
