import IMask from 'imask';
import { nextTick } from 'vue';
import type { DiagnosticMask, MaskDiagnosticRecord, MaskDiagnosticWindow } from '~/tests/playwright/types';

// Serialized by addInitScript: this function must not close over runtime imports.
export function installMaskRecorder() {
  const diagnosticWindow = window as unknown as MaskDiagnosticWindow;
  const records: Array<MaskDiagnosticRecord> = [];
  const controls = new WeakMap<HTMLInputElement, DiagnosticMask>();
  const destroyed = new WeakSet<DiagnosticMask>();
  const ids = new WeakMap<object, number>();
  let nextId = 0;
  let mainInput: HTMLInputElement | undefined;

  function identify(value: object) {
    if (!ids.has(value)) {
      nextId += 1;
      ids.set(value, nextId);
    }

    return ids.get(value);
  }

  function describe(element: Element | null) {
    return element == null ? null : { tag: element.tagName, id: element.id, role: element.getAttribute('role') };
  }

  function record(phase: string, input = mainInput, detail: MaskDiagnosticRecord = {}) {
    const control = input == null ? undefined : controls.get(input);

    records.push({
      sequence: records.length,
      time: performance.now(),
      phase,
      ...detail,
      dom: input == null
        ? null
        : {
            value: input.value,
            selectionStart: input.selectionStart,
            selectionEnd: input.selectionEnd,
            selectionDirection: input.selectionDirection,
            readonly: input.readOnly,
            disabled: input.disabled,
          },
      focus: {
        active: describe(document.activeElement),
        inputFocused: document.activeElement === input,
        documentFocused: document.hasFocus(),
      },
      mask: control == null
        ? null
        : {
            id: identify(control),
            modelId: identify(control.masked),
            connected: !destroyed.has(control),
            value: control.value,
            unmaskedValue: control.unmaskedValue,
            rawInputValue: control.masked.rawInputValue,
            isComplete: control.masked.isComplete,
            displayValue: control.masked.displayValue,
            cursorPos: destroyed.has(control) ? null : control.cursorPos,
            selectionStart: destroyed.has(control) ? null : control.selectionStart,
            savedSelection: { ...control._selection },
            cursorChanging: control._cursorChanging != null,
            changingCursorPos: control._changingCursorPos,
          },
      vue: diagnosticWindow.__drMaskDiagnostic.readVue?.() ?? null,
      rendered: {
        model: document.querySelector('[data-testid="model"]')?.textContent,
        updates: document.querySelector('[data-testid="updates"]')?.textContent,
      },
    });
  }

  function track(control: DiagnosticMask, source: string) {
    const input = control.el.input;

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    if (source === 'dr-front' && input.closest('.DrMaskedInputGallery__main') == null) {
      return;
    }

    mainInput = input;
    controls.set(input, control);
    record('mask:create', input, { source });

    const originalFire = control._fireEvent.bind(control);

    control._fireEvent = function (...args) {
      record(`mask:${args[0]}:before`, input);

      try {
        originalFire.apply(this, args);

        return;
      } finally {
        record(`mask:${args[0]}:after`, input);
      }
    };

    const originalUpdate = control.updateControl.bind(control);

    control.updateControl = function (...args) {
      record('mask:updateControl:before', input, { cursorArgument: args[0] });
      originalUpdate(...args);
      record('mask:updateControl:after', input);
    };

    const originalDestroy = control.destroy.bind(control);

    control.destroy = function () {
      record('mask:destroy:before', input);
      originalDestroy();
      destroyed.add(control);
      record('mask:destroy:after', input);
      controls.delete(input);
    };
  }

  diagnosticWindow.__drMaskDiagnostic = { records, record, track };

  // Window capture runs before target listeners; window bubble runs after them.
  // Observe input processing without changing IMask's registered DOM handlers.
  for (const capture of [true, false]) {
    for (const name of ['focus', 'blur', 'focusin', 'focusout', 'keydown', 'beforeinput', 'input', 'select', 'selectionchange']) {
      window.addEventListener(name, (event) => {
        const input = event.target;

        if (!(input instanceof HTMLInputElement) || !controls.has(input)) {
          return;
        }

        record(`${name}:${capture ? 'capture' : 'bubble'}`, input, {
          event: {
            type: event.type,
            isTrusted: event.isTrusted,
            defaultPrevented: event.defaultPrevented,
            inputType: event instanceof InputEvent ? event.inputType : undefined,
            data: event instanceof InputEvent ? event.data : undefined,
            isComposing: event instanceof InputEvent ? event.isComposing : undefined,
            key: event instanceof KeyboardEvent ? event.key : undefined,
          },
        });
      }, capture);
    }
  }

  const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');

  if (valueDescriptor?.set == null) {
    throw new Error('Input value setter is unavailable for diagnostics.');
  }

  Object.defineProperty(HTMLInputElement.prototype, 'value', {
    ...valueDescriptor,
    set(this: HTMLInputElement, value: string) {
      if (controls.has(this)) {
        record('dom:value:before', this, { next: value, stack: new Error().stack });
      }

      valueDescriptor.set?.call(this, value);

      if (controls.has(this)) {
        record('dom:value:after', this);
      }
    },
  });
}

export function mountNativeMask() {
  const input = document.createElement('input');
  input.id = 'native-mask';
  input.type = 'text';
  input.value = '123-456';
  document.body.replaceChildren(input);
  const control = IMask(input, { mask: '000-000' });
  (window as unknown as MaskDiagnosticWindow).__drMaskDiagnostic.track(control as DiagnosticMask, 'native-imask');
}

export async function recordAfterVue(input: HTMLInputElement, phase: string) {
  await nextTick();
  (window as unknown as MaskDiagnosticWindow).__drMaskDiagnostic.record(phase, input);
}
