import { createApp, defineComponent, h, ref } from 'vue';
import { useDialog } from '@/dialogs/composables/useDialog/useDialog';
import { DrModalHost, DrSelect, DrToastHost, useDrToast } from '@/index';
import type { ScopeOptions, ScopeRegistry } from '@/overlays/components/DrModalHost/HostScopes/types.support';

const DialogBody = defineComponent({
  props: { name: { type: String, required: true } },
  setup(props) {
    const toast = useDrToast();
    const selected = ref('one');

    return () => [
      h('button', { onClick: () => toast.info({ message: `dialog ${props.name}`, duration: 30_000 }) }, 'Dialog toast'),
      h(DrSelect<string>, {
        label: 'Nested select',
        items: ['one', 'two'],
        modelValue: selected.value,
        'onUpdate:modelValue': (value: string) => {
          selected.value = value;
        },
      }),
    ];
  },
});

function createProbe(name: string, registry: ScopeRegistry) {
  return defineComponent({
    setup() {
      const toast = useDrToast();
      const dialog = useDialog({ title: `Dialog ${name}`, closeOnBackdrop: true, component: DialogBody, props: { name } });

      registry.set(name, { toast, dialog });

      return () => h('button', { onClick: () => {
        dialog.open();
      } }, `Trigger ${name}`);
    },
  });
}

export function mountScope(options: ScopeOptions) {
  const Probe = createProbe(options.name, options.registry);
  const Nested = createProbe(`${options.name}-nested`, options.registry);

  const app = createApp({
    render: () => h(DrModalHost, { backgroundRoot: options.sharedBackground.value ?? options.root }, {
      default: () => h(DrToastHost, null, {
        default: () => [
          options.ownerMounted.value ? h(Probe) : null,
          h(DrToastHost, null, { default: () => h(Nested) }),
        ],
      }),
    }),
  });

  app.config.idPrefix = options.name;
  app.mount(options.root);

  return app;
}

export function mountBareSelect(root: HTMLElement, onError: (message: string) => void) {
  const selected = ref('one');

  const app = createApp({
    render: () => h(DrSelect<string>, {
      label: 'Without Host',
      items: ['one', 'two'],
      modelValue: selected.value,
      'onUpdate:modelValue': (value: string) => {
        selected.value = value;
      },
    }),
  });

  app.config.errorHandler = (error) => {
    onError(String(error));
  };

  app.config.idPrefix = 'bare';
  app.mount(root);

  return app;
}
