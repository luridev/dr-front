# Dr Front

> The web is terminally ill.

UI components for Vue 3.

## Installation

```sh
npm install @protoapps/dr-front
```

## Requirements

- **Vue:** `^3.5.40` (peer dependency).
- **TypeScript:** 6.0+, with published declarations validated using `moduleResolution: "Bundler"`.
- **Browsers:** Baseline Widely Available as of 2026-09-25.
- **Temporal:** `DrInputDate` and `DrInputTime` require a global `Temporal` implementation, either native or supplied by your application through a polyfill. Dr Front does not install a runtime polyfill automatically. Other components do not require Temporal.

## Usage

The stylesheet is required; import it once in your application entry point.

```ts
import { DrFrontProvider, DrButton, useDrToast } from '@protoapps/dr-front';
import { DrCloseIcon } from '@protoapps/dr-front/icons';

import '@protoapps/dr-front/styles.css';
```

`DrInputNumber` works with JavaScript safe integers.

`DrMaskedInput` uses [IMask](https://imask.js.org/guide.html) and accepts a pattern string or a native IMask options object. Its `v-model` contains IMask's `unmaskedValue` as a string.

## Configuration

Ordinary UI components work without a provider. `DrFrontProvider` combines configuration, `DrToastHost` and `DrModalHost`; all of its props are optional.

```vue
<DrFrontProvider language="ru" locale="en-GB">
  <ApplicationContent />
</DrFrontProvider>
```

`useDrToast()` must be called synchronously during `setup()` in a descendant of `DrFrontProvider` or `DrToastHost`.

To enable the modal mode of `DrSelect`, pass a mounted application container (`HTMLElement`) inside `body` as `background-root` to `DrFrontProvider` or `DrModalHost`. Without a valid root, `DrSelect` uses a popup.

`DrConfigProvider`, `DrToastHost` and `DrModalHost` can also be used independently.

Supported languages: `en`, `ru`. Supported locales: `en-US`, `en-GB`, `ru-RU`. The defaults are `en` and `en-US`. Set `language` and `locale` independently to choose UI messages and regional number, date and time formatting.
