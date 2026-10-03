<script setup lang="ts">
import { computed } from 'vue';
import { DrModalHost, DrToastHost } from '@/index';
import { galleryGroups } from '~/gallery/config';
import { version } from '~/package.json';
import type { GalleryHostEmits, GalleryHostProps } from '~/gallery/types';

defineOptions({ inheritAttrs: false });

const props = defineProps<GalleryHostProps>();
const emit = defineEmits<GalleryHostEmits>();

function createLink(storyId: string | null, canvas = false): string {
  const url = new URL(window.location.href);

  url.searchParams.set('theme', props.state.theme);

  if (storyId === null) {
    url.searchParams.delete('story');
  } else {
    url.searchParams.set('story', storyId);
  }

  if (canvas) {
    url.searchParams.set('view', 'canvas');
  } else {
    url.searchParams.delete('view');
  }

  return `${url.pathname}${url.search}`;
}

const groups = computed(() => galleryGroups.map((group) => ({
  ...group,
  stories: group.stories.map((story) => ({ ...story, href: createLink(story.id) })),
})));

const selectedExample = computed(() => galleryGroups
  .flatMap((group) => group.stories)
  .find((story) => story.id === props.state.storyId));

const catalogHref = computed(() => createLink(null));
const canvasHref = computed(() => createLink(props.state.storyId, true));
const stageClass = computed(() => ({ GalleryHost__stage_canvas: props.state.view === 'canvas' }));

function handleStoryClick(event: MouseEvent, storyId: string | null) {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) {
    return;
  }

  event.preventDefault();
  emit('selectStory', storyId);
}

function handleThemeClick() {
  emit('changeTheme', props.state.theme === 'light' ? 'dark' : 'light');
}

function handleCatalogClick(event: MouseEvent) {
  handleStoryClick(event, null);
}
</script>

<template>
  <DrModalHost :background-root="props.backgroundRoot" />

  <DrToastHost />

  <header
    v-if="props.state.view === 'gallery'"
    class="GalleryHost__header"
  >
    <div>
      <p class="GalleryHost__eyebrow">Vue 3 · v{{ version }}</p>

      <h1 class="GalleryHost__title">Dr Front</h1>

      <p class="GalleryHost__intro">Component gallery</p>
    </div>

    <button
      class="GalleryHost__button"
      type="button"
      :aria-pressed="props.state.theme === 'dark'"
      @click="handleThemeClick"
    >
      Dark mode
    </button>
  </header>

  <main>
    <div
      v-if="props.state.view === 'gallery' && props.state.storyId === null"
      class="GalleryHost__catalog"
    >
      <section
        v-for="group in groups"
        :key="group.title"
        class="GalleryHost__group"
      >
        <h2>{{ group.title }}</h2>

        <ul class="GalleryHost__list">
          <li
            v-for="story in group.stories"
            :key="story.id"
          >
            <a
              class="GalleryHost__card"
              :href="story.href"
              @click="(event) => handleStoryClick(event, story.id)"
            >
              <strong>{{ story.title }}</strong>

              <span>{{ story.description }}</span>
            </a>
          </li>
        </ul>
      </section>
    </div>

    <div
      v-if="props.state.view === 'gallery' && props.state.storyId !== null"
      class="GalleryHost__navigation"
    >
      <nav aria-label="Component gallery">
        <a
          :href="catalogHref"
          @click="handleCatalogClick"
        >All components</a>

        <a
          v-if="!props.state.error"
          :href="canvasHref"
        >Canvas</a>
      </nav>

      <h2>{{ selectedExample?.title ?? 'Test story' }}</h2>
    </div>

    <div
      id="root"
      class="GalleryHost__stage"
      :class="stageClass"
    >
      <p
        v-if="props.state.error"
        role="alert"
      >{{ props.state.error }}</p>

      <component
        :is="props.state.component"
        v-if="props.state.component"
        v-bind="props.state.props"
      />
    </div>
  </main>
</template>

<style scoped>
  .GalleryHost__header,
  .GalleryHost__catalog,
  .GalleryHost__navigation,
  .GalleryHost__stage {
    width: min(100% - 32px, 1120px);
    margin-inline: auto;
  }

  .GalleryHost__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--dr-space-medium);
    padding-block: var(--dr-space-large);
    border-bottom: 1px solid var(--dr-color-border-base);
  }

  .GalleryHost__eyebrow {
    margin: 0;
    color: var(--dr-color-text-secondary);
    font-size: var(--dr-font-size-small);
  }

  .GalleryHost__title {
    margin-block: var(--dr-space-small);
    font-size: 2.5rem;
    letter-spacing: -0.04em;
  }

  .GalleryHost__intro {
    margin: 0;
  }

  .GalleryHost__button {
    padding: var(--dr-space-small) var(--dr-space-medium);
    color: var(--dr-color-text-primary);
    background: var(--dr-color-background-primary);
    border: 1px solid var(--dr-color-border-primary);
    border-radius: var(--dr-border-radius-control);
    font: inherit;
    cursor: pointer;
  }

  .GalleryHost__catalog,
  .GalleryHost__navigation {
    padding-block: var(--dr-space-large);
  }

  .GalleryHost__group + .GalleryHost__group {
    margin-block-start: 32px;
  }

  .GalleryHost__group h2 {
    margin-block: 0 var(--dr-space-medium);
  }

  .GalleryHost__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
    gap: var(--dr-space-medium);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .GalleryHost__card {
    display: flex;
    flex-direction: column;
    gap: var(--dr-space-small);
    height: 100%;
    padding: var(--dr-space-large);
    color: var(--dr-color-text-primary);
    background: var(--dr-color-background-primary);
    border: 1px solid var(--dr-color-border-primary);
    border-radius: var(--dr-border-radius-surface);
    text-decoration: none;
  }

  .GalleryHost__card:hover {
    border-color: var(--dr-color-text-secondary);
  }

  .GalleryHost__card span {
    color: var(--dr-color-text-secondary);
    line-height: 1.5;
  }

  .GalleryHost__navigation nav {
    display: flex;
    flex-wrap: wrap;
    gap: var(--dr-space-large);
  }

  .GalleryHost__navigation h2 {
    margin-block: var(--dr-space-large) 0;
    overflow-wrap: anywhere;
  }

  .GalleryHost__stage {
    padding-block-end: 48px;
  }

  .GalleryHost__stage_canvas {
    width: 100%;
    padding: var(--dr-space-medium);
  }
</style>
