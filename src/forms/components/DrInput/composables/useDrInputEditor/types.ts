import type { HTMLAttributes, MaybeRef, Ref } from 'vue';

export type DrInputEditorParams = {
  input: Readonly<Ref<HTMLInputElement | null>>;
  model: Ref<string>;
  readonly: () => boolean;
};

export type DrInputEditor = {
  inputMode?: MaybeRef<HTMLAttributes['inputmode']>;
  handleInput?: () => void;
};

export type DrInputEditorFactory = (params: DrInputEditorParams) => DrInputEditor;
