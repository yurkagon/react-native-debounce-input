---
"react-native-debounce-input": major
---

2.0.0 — full modernization.

- Rewritten as a typed functional component (`forwardRef` + `memo`) with a reusable
  `useDebouncedCallback` hook.
- Fixed bugs: external `value` prop is now synced (hybrid controlled/uncontrolled), blur
  flushes the current text (no stale state), pending timers are cleared on unmount, and a
  missing `onChangeText` no longer throws.
- New `delay` prop and direct `ref` forwarding; `delayTimeout` and `inputRef` still work but
  are deprecated.
- Ships dual ESM/CJS builds plus TypeScript declarations; raw source is exposed to React
  Native via the `react-native` export condition. Works with `react-native-web`.
