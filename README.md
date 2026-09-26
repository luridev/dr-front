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
  DrButton,
  DrInputDate,
  toast,
  useControlsState,
} from '@protoapps/dr-front';

import { DrCloseIcon } from '@protoapps/dr-front/icons';
import { formatNumber } from '@protoapps/dr-front/lib';

import '@protoapps/dr-front/styles.css';
```

## Browser requirements

Core functionality targets Baseline Widely Available as of **2026-09-25**. Changing this snapshot is an explicit change to the library's browser requirements.

## TypeScript

Dr Front is intended for bundler-based Vue applications. Its published declarations are validated with TypeScript `moduleResolution: "Bundler"`.

## Temporal

`DrInputDate` and `DrInputTime` use the global `Temporal` API.

The package references TypeScript's Temporal declarations, but does not install a runtime polyfill. Applications that use date/time components must provide `Temporal` themselves, either natively or with a polyfill.

TypeScript consumers require TypeScript 6.0 or newer.
