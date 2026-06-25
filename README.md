# react-native-debounce-input

[![npm](https://img.shields.io/npm/v/react-native-debounce-input.svg?style=flat-square)](https://npmjs.com/package/react-native-debounce-input)
[![license](https://img.shields.io/npm/l/react-native-debounce-input.svg?style=flat-square)](./LICENSE)

A tiny, typed `TextInput` for **React Native** and **react-native-web** that debounces
`onChangeText`. Type freely — your handler only fires once the user pauses (or blurs).

![demo](https://raw.githubusercontent.com/yurkagon/react-native-debounce-input/main/react-native-debounce-input.gif)

- Zero runtime dependencies
- Functional component, `forwardRef`, `React.memo`
- First-class TypeScript types
- Works on iOS, Android, and the web (react-native-web)

## Install

```sh
npm install react-native-debounce-input
# or
pnpm add react-native-debounce-input
# or
yarn add react-native-debounce-input
```

`react` (>=18) and `react-native` (>=0.74) are peer dependencies.

## Usage

```tsx
import { useRef, useState } from "react";
import { TextInput } from "react-native";
import { DelayInput } from "react-native-debounce-input";

function Search() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  return (
    <DelayInput
      ref={inputRef}
      placeholder="Search…"
      delay={500}
      minLength={3}
      onChangeText={setQuery}
    />
  );
}
```

`DelayInput` forwards every standard `TextInput` prop (`placeholder`, `style`, `keyboardType`, …).

## Props

| Prop              | Type                      | Default | Description                                                                          |
| ----------------- | ------------------------- | ------- | ------------------------------------------------------------------------------------ |
| `onChangeText`    | `(value: string) => void` | —       | **Required.** Called with the debounced text, or `""` when shorter than `minLength`. |
| `delay`           | `number`                  | `600`   | Debounce delay in milliseconds.                                                      |
| `minLength`       | `number`                  | `3`     | Minimum length before a non-empty value is emitted.                                  |
| `value`           | `string`                  | `""`    | Initial value; also synced into the input when changed externally.                   |
| `ref`             | `Ref<TextInput>`          | —       | Forwarded to the underlying `TextInput`.                                             |
| …`TextInputProps` | —                         | —       | Any other React Native `TextInput` prop.                                             |

### Behaviour notes

- **Instant feedback, debounced callback.** The input reflects every keystroke immediately;
  only `onChangeText` is debounced.
- **Blur commits immediately.** Leaving the field flushes the current text without waiting
  for the timer.
- **External `value` wins.** Changing the `value` prop from the parent (e.g. a "clear"
  button) syncs the input and cancels any pending debounce.

## `useDebouncedCallback`

The debounce primitive is exported for reuse:

```ts
import { useDebouncedCallback } from "react-native-debounce-input";

const search = useDebouncedCallback((q: string) => fetchResults(q), 400);
search.run(query); // schedule
search.flush(); // run now with the last args
search.cancel(); // drop the pending run
```

The handle keeps a stable identity across renders and clears its timer on unmount.

## Migrating from 1.x

`DelayInput` is still the default and named export, and 1.x code keeps working. Two props are
now deprecated (they still function, with a dev-only warning):

| 1.x            | 2.0     | Notes                                            |
| -------------- | ------- | ------------------------------------------------ |
| `delayTimeout` | `delay` | `delayTimeout` is still accepted as a fallback.  |
| `inputRef`     | `ref`   | Pass `ref` directly (the component forwards it). |

Behavioural fixes in 2.0 that may affect you:

- External `value` prop changes now update the input (previously ignored).
- Blur no longer re-fires `onChangeText` if the latest value was already committed.

## Development

This repository is a [pnpm](https://pnpm.io) workspace (requires Node >=20.11):

| Path                      | What                                                                |
| ------------------------- | ------------------------------------------------------------------- |
| `packages/debounce-input` | The published library.                                              |
| `apps/demo`               | A private Vite + react-native-web playground for local development. |

```sh
pnpm install      # install the whole workspace
pnpm dev          # run the react-native-web demo (Vite)
pnpm test         # run the library test suite (Vitest)
pnpm typecheck    # type-check every package
pnpm lint         # ESLint across the repo
pnpm build        # build the library (tsup → ESM + CJS + d.ts)
```

The demo consumes the library source directly via `workspace:*`, so edits to the library
hot-reload with no build step. This `README.md` is the single source of truth — it is copied
into the package on publish. Releases are handled by
[changesets](https://github.com/changesets/changesets) (`pnpm changeset`).

## License

MIT © [Yurii Khvyshchuk](https://github.com/yurkagon)
