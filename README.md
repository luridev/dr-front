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
import { formatNumber } from '@protoapps/dr-front/lib';

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

Built-in messages can be overridden with a typed callback:

```ts
const translate: DrTranslateOverride = ({ language, key }) =>
  language === 'en' && key === 'dialog.close' ? 'Dismiss' : undefined;
```

Supported languages: `en`, `ru`. Supported locales: `en-US`, `en-GB`, `ru-RU`. Settings are inferred automatically, defaulting to `en` and `en-US`. Locale-based input formatting is not yet implemented.

## Requirements

- **Browsers:** Baseline Widely Available as of 2026-09-25. Changing this snapshot changes the library's browser support policy.
- **TypeScript:** 6.0+, with published declarations validated using `moduleResolution: "Bundler"`.
- **Temporal:** `DrInputDate` and `DrInputTime` require a global `Temporal` implementation (native or polyfilled). The package references TypeScript's Temporal declarations but does not install a runtime polyfill.

## Masked inputs

`DrMaskedInput` supports Pattern masks and arbitrary-precision integer input.

```vue
<DrMaskedInput v-model="code" mask="000-000" />
<DrMaskedInput v-model="serial" :mask="{ pattern: 'HH-0000', definitions: { H: /[A-F0-9]/ } }" />
<DrMaskedInput v-model="timestamp" :mask="{ type: 'integer' }" />
```

`v-model` stores a canonical string without decorative separators. Pattern preserves leading zeros; Integer normalizes leading zeros and negative zero.

## Component gallery

Run locally with `npm run dev`.
