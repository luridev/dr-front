import { describe, expect, it, vi } from 'vitest';
import { computed, createRenderer, createSSRApp, defineComponent, h, nextTick, ref, shallowRef } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { provideDrInputEditor, useDrInputEditor } from '@/forms/components/DrInput/composables/useDrInputEditor/useDrInputEditor';
import type { Component } from 'vue';
import type { DrInputEditor, DrInputEditorFactory } from '@/forms/components/DrInput/composables/useDrInputEditor/types';

function createEditorProbe() {
  const results = new Map<string, DrInputEditor>();
  const input = shallowRef<HTMLInputElement | null>(null);
  const model = ref('initial');
  const readonly = ref(false);
  const params = { input, model, readonly: () => readonly.value };

  const Input = defineComponent({
    props: { name: { type: String, required: true } },
    setup(props, { slots }) {
      results.set(props.name, useDrInputEditor(params));

      return () => h('div', slots.default?.());
    },
  });

  function provider(factory: DrInputEditorFactory): Component {
    return defineComponent({
      setup(_props, { slots }) {
        provideDrInputEditor(factory);

        return () => slots.default?.();
      },
    });
  }

  function editor(name = 'input') {
    const result = results.get(name);

    if (result == null) {
      throw new Error(`Input probe was not rendered: ${name}`);
    }

    return result;
  }

  return { Input, provider, editor, params, readonly };
}

describe('useDrInputEditor', () => {
  it('writes external values to the current input and stops synchronizing after unmount', async () => {
    const { Input, params } = createEditorProbe();

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

    const app = renderer.createApp(Input, { name: 'input' });

    app.mount({});

    try {
      params.model.value = 'before input';
      await nextTick();
      params.input.value = { value: '' } as HTMLInputElement;
      await nextTick();
      expect(params.input.value.value).toBe('before input');

      params.model.value = 'external';
      await nextTick();
      expect(params.input.value.value).toBe('external');

      const previous = params.input.value;

      params.input.value = { value: 'replacement' } as HTMLInputElement;
      await nextTick();
      expect(params.input.value.value).toBe('external');
      params.model.value = '';
      await nextTick();
      expect(params.input.value.value).toBe('');
      expect(previous.value).toBe('external');
    } finally {
      app.unmount();
    }

    params.model.value = 'after unmount';
    await nextTick();
    expect(params.input.value.value).toBe('');
  });

  it('edits plain text without a provider and ignores events without an input or while readonly', async () => {
    const { Input, editor, params, readonly } = createEditorProbe();

    await renderToString(createSSRApp(() => h(Input, { name: 'input' })));

    expect(editor().inputMode).toBeUndefined();
    editor().handleInput();
    expect(params.model.value).toBe('initial');

    params.input.value = { value: 'plain / 日本語' } as HTMLInputElement;
    editor().handleInput();
    expect(params.model.value).toBe('plain / 日本語');

    readonly.value = true;
    params.input.value.value = 'blocked';
    editor().handleInput();
    expect(params.model.value).toBe('plain / 日本語');
  });

  it('passes the live field bindings to the editor and preserves reactive input mode', async () => {
    const { Input, provider, editor, params, readonly } = createEditorProbe();
    const mode = ref<'text' | 'numeric'>('text');
    const result = { inputMode: computed(() => mode.value), handleInput: vi.fn() };
    const factory = vi.fn(() => result);
    const Provider = provider(factory);

    await renderToString(createSSRApp(() => h(Provider, null, () => h(Input, { name: 'input' }))));

    expect(factory).toHaveBeenCalledExactlyOnceWith(params);
    expect(editor()).toBe(result);
    expect(editor().inputMode?.value).toBe('text');
    mode.value = 'numeric';
    expect(editor().inputMode?.value).toBe('numeric');
    readonly.value = true;
    expect(params.readonly()).toBe(true);
  });

  it('isolates slot descendants while preserving the provider for sibling fields', async () => {
    const { Input, provider, editor } = createEditorProbe();
    const result = { handleInput: vi.fn() };
    const factory = vi.fn(() => result);
    const Provider = provider(factory);

    await renderToString(createSSRApp(() => h(Provider, null, () => [
      h(Input, { name: 'parent' }, () => h(Input, { name: 'slot' })),
      h(Input, { name: 'sibling' }),
    ])));

    expect(editor('parent')).toBe(result);
    expect(editor('sibling')).toBe(result);
    expect(editor('slot')).not.toBe(result);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('uses the nearest nested provider and isolates its descendants again', async () => {
    const { Input, provider, editor } = createEditorProbe();
    const outer = { handleInput: vi.fn() };
    const inner = { handleInput: vi.fn() };
    const Outer = provider(() => outer);
    const Inner = provider(() => inner);

    await renderToString(createSSRApp(() => h(Outer, null, () =>
      h(Input, { name: 'outer' }, () =>
        h(Inner, null, () => h(Input, { name: 'inner' }, () => h(Input, { name: 'slot' }))),
      ),
    )));

    expect(editor('outer')).toBe(outer);
    expect(editor('inner')).toBe(inner);
    expect(editor('slot')).not.toBe(inner);
    expect(editor('slot')).not.toBe(outer);
  });
});
