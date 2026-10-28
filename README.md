# Dr Front

> The web is terminally ill.

Accessible Vue 3 UI components with sensible defaults and useful extras.

## Installation

```sh
npm install @protoapps/dr-front
```

## Usage

```ts
import {
  DrFrontProvider,
  DrButton,
  DrInputDate,
  useDrToast,
  useControlsState,
  type DrTranslateOverride,
} from '@protoapps/dr-front';

import { DrCloseIcon } from '@protoapps/dr-front/icons';

import '@protoapps/dr-front/styles.css';
```

## Configuration

`DrFrontProvider` combines localization, notifications and modal dialogs in a renderless component. All props are optional.

```vue
<DrFrontProvider language="ru" :translate="translate">
  <ApplicationContent />
</DrFrontProvider>
```

Pass `background-root` to enable modal dialogs. `DrConfigProvider`, `DrToastHost` and `DrModalHost` can also be used independently. Ordinary UI components require no provider.

`background-root` must be connected and cannot be `body`, `html`, or an element containing the modal portal. Without a valid root, `DrSelect` falls back to a popup. Existing dialogs close if the root becomes unavailable or changes to another document.

Built-in messages can be overridden with a typed callback:

```ts
const translate: DrTranslateOverride = ({ language, key }) =>
  language === 'en' && key === 'dialog.close' ? 'Dismiss' : undefined;
```

Supported languages: `en`, `ru`. Supported locales: `en-US`, `en-GB`, `ru-RU`. Settings are inferred automatically, defaulting to `en` and `en-US`. The effective locale controls number, date and time input formatting and textarea counters. Set `language` and `locale` independently when the interface language and regional format differ.

## Requirements

- **Browsers:** Baseline Widely Available as of 2026-09-25. Changing this snapshot changes the library's browser support policy.
- **TypeScript:** 6.0+, with published declarations validated using `moduleResolution: "Bundler"`.
- **Temporal:** `DrInputDate` and `DrInputTime` require a global `Temporal` implementation (native or polyfilled). The package references TypeScript's Temporal declarations but does not install a runtime polyfill.

## Masked inputs

`DrMaskedInput` uses [IMask](https://imask.js.org/guide.html) and accepts a pattern string or an IMask options object.

```vue
<DrMaskedInput v-model="code" mask="000-000" />
<DrMaskedInput v-model="serial" :mask="{ mask: 'HH-0000', definitions: { H: /[A-F0-9]/ } }" />
<DrMaskedInput v-model="digits" :mask="{ mask: /^\d*$/ }" />
```

`v-model` stores IMask's `unmaskedValue` as a string; its format depends on the mask. Configuration changes are reactive and reset editing history when the effective options change.

Number masks follow JavaScript number precision limits. With `expose`, only the exposed value is stored, so other blocks cannot be restored from `v-model` after remounting or changing the mask.

## Component gallery

Run locally with `npm run dev`.
