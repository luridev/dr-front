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
  DrConfigProvider,
  DrButton,
  DrInputDate,
  useDrToast,
  useControlsState,
} from '@protoapps/dr-front';

import { DrCloseIcon } from '@protoapps/dr-front/icons';
import { formatNumber } from '@protoapps/dr-front/lib';

import '@protoapps/dr-front/styles.css';
```

## Component gallery

Run locally:

```sh
npm run dev
```

## Localization

`DrConfigProvider` optionally configures the UI language and locale. Defaults are `en` and `en-US`.

```vue
<DrConfigProvider language="ru" :translate="translate">
  <ApplicationContent />
</DrConfigProvider>
```

Built-in messages can be overridden with a typed callback:

```ts
const translate: DrTranslateOverride = ({ language, key }) =>
  language === 'en' && key === 'dialog.close' ? 'Dismiss' : undefined;
```

Supported languages: `en`, `ru`. Supported locales: `en-US`, `en-GB`, `ru-RU`. Missing settings are inferred automatically. Locale-based input formatting is not yet implemented.

## Browser requirements

Core functionality targets Baseline Widely Available as of **2026-09-25**. Changing this snapshot is an explicit change to the library's browser requirements.

## TypeScript

Dr Front is intended for bundler-based Vue applications. Its published declarations are validated with TypeScript `moduleResolution: "Bundler"`.

## Temporal

`DrInputDate` and `DrInputTime` use the global `Temporal` API.

The package references TypeScript's Temporal declarations, but does not install a runtime polyfill. Applications that use date/time components must provide `Temporal` themselves, either natively or with a polyfill.

TypeScript consumers require TypeScript 6.0 or newer.


## Masked string inputs

`DrMaskedInput` adds Pattern masks and arbitrary-precision integer input to the standard text field.

```vue
<DrMaskedInput v-model="code" mask="000-000" />
<DrMaskedInput v-model="serial" :mask="{ pattern: 'HH-0000', definitions: { H: /[A-F0-9]/ } }" />
<DrMaskedInput v-model="timestamp" :mask="{ type: 'integer' }" />
```

`v-model` is a canonical string without decorative separators: Pattern preserves leading zeros, while Integer normalizes leading zeros and negative zero.
