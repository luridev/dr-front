import { createRenderer, defineComponent, h } from 'vue';

export function mountSetup(setup: () => void, provideDependencies: () => void = () => undefined) {
  const renderer = createRenderer({
    createElement: () => ({}),
    createText: () => ({}),
    createComment: () => ({}),
    insert: () => undefined,
    remove: () => undefined,
    setText: () => undefined,
    setElementText: () => undefined,
    patchProp: () => undefined,
    parentNode: () => null,
    nextSibling: () => null,
  });

  const Child = defineComponent({ setup() {
    setup();

    return () => null;
  } });

  const app = renderer.createApp(defineComponent({
    setup() {
      provideDependencies();

      return () => h(Child);
    },
  }));

  app.mount({});

  return app;
}

export function requireValue<T>(value: T | null | undefined): T {
  if (value == null) {
    throw new Error('Expected a test value.');
  }

  return value;
}
