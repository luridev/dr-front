import 'temporal-polyfill/global';
import { createApp, nextTick, shallowReactive } from 'vue';
import '@/styles/index.css';
import ComponentHost from '~/tests/playwright/host/ComponentHost.vue';
import type { HostState, HostWindow, StoryModule } from '~/tests/playwright/types';

const stories = import.meta.glob<StoryModule | undefined>('../../../src/**/*.story.vue', { eager: true });
const backgroundRoot = document.getElementById('host');

if (backgroundRoot == null) {
  throw new Error('Component host root is missing.');
}

const state = shallowReactive<HostState>({ component: null, props: {} });
const hostWindow = window as unknown as HostWindow;

createApp(ComponentHost, { backgroundRoot, state }).mount(backgroundRoot);

hostWindow.mount = async ({ story, props }) => {
  const module = stories[`../../../src/${story}.story.vue`];

  if (module == null) {
    throw new Error(`Unknown component story: ${story}`);
  }

  state.component = module.default;
  state.props = props ?? {};
  await nextTick();
};

document.documentElement.dataset.hostReady = 'true';
