# react-native-debounce-input

## 2.0.0

A full rewrite and modernization of the package. **This release contains breaking changes
and ships no backward-compatibility shims.**

### Breaking Changes

- **Removed the `delayTimeout` prop.** Use `delay` instead.
- **Removed the `inputRef` prop.** The component is now built with `forwardRef`; pass `ref`
  directly.
- **`onChangeText` now always receives a `string`** (previously `string | number`).
- Requires `react >= 18` and `react-native >= 0.74` (declared as peer dependencies).

### Fixed

- External changes to the `value` prop are now synced into the input. In 1.x the value was
  read only once on mount, so programmatic updates (e.g. a "clear" button) were ignored.
- Blur now commits the **current** text. In 1.x the blur handler read stale React state due
  to the asynchronous `setState`, so the last keystroke could be dropped.
- Pending debounce timers are always cleared on unmount and before each reschedule, removing
  the "setState on an unmounted component" / leaked-timer risk.
- A missing `onChangeText` no longer throws at runtime.

### Added

- Written in TypeScript with first-class, shipped type definitions.
- Hybrid controlled/uncontrolled behaviour: keystrokes render instantly while the callback is
  debounced, and an external `value` change takes over and cancels any pending debounce.
- Dual ESM + CJS builds plus raw source exposed to React Native via the `react-native` export
  condition. Verified to work with `react-native-web`.

### Changed

- Rewritten from a class `PureComponent` to a memoized functional component, eliminating the
  ineffective `PureComponent` shallow-compare against an always-new `onChangeText` reference.
- Tooling overhaul: pnpm monorepo, `tsup` build, Vitest test suite, and ESLint 9 + Prettier.
