import React, { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TextInput } from "react-native";
import type { TextInputProps } from "react-native";

import { useDebouncedCallback } from "./useDebouncedCallback";

// Provided by React Native / react-native-web / bundler define. Guarded with
// `typeof` everywhere so plain web/Node consumers never hit a ReferenceError.
declare const __DEV__: boolean;

export interface DelayInputProps extends Omit<TextInputProps, "onChangeText"> {
  /**
   * Called with the debounced text once the user stops typing for `delay` ms,
   * or immediately on blur. Receives `""` when the text is shorter than
   * `minLength`.
   */
  onChangeText: (value: string) => void;
  /** Debounce delay in milliseconds. @default 600 */
  delay?: number;
  /** Minimum length before a non-empty value is emitted. @default 3 */
  minLength?: number;
  /** Initial value, also synced when this prop changes externally. */
  value?: string;
  /**
   * @deprecated Use `delay` instead. Kept for 1.x compatibility.
   */
  delayTimeout?: number;
  /**
   * @deprecated Pass `ref` directly instead. Kept for 1.x compatibility.
   */
  inputRef?: React.Ref<TextInput>;
}

const isDev =
  typeof __DEV__ !== "undefined"
    ? __DEV__
    : typeof process !== "undefined" && process.env?.NODE_ENV !== "production";

const warned = new Set<string>();
function warnDeprecated(prop: string, replacement: string) {
  if (!isDev || warned.has(prop)) return;
  warned.add(prop);
  console.warn(
    `[react-native-debounce-input] \`${prop}\` is deprecated and will be removed in a future major. Use \`${replacement}\` instead.`,
  );
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

const DelayInputInner = forwardRef<TextInput, DelayInputProps>(function DelayInput(
  {
    onChangeText,
    delay,
    delayTimeout,
    minLength = 3,
    value: valueProp,
    inputRef,
    onBlur: onBlurProp,
    ...textInputProps
  },
  ref,
) {
  if (isDev && delayTimeout !== undefined) warnDeprecated("delayTimeout", "delay");
  if (isDev && inputRef !== undefined) warnDeprecated("inputRef", "ref");

  const resolvedDelay = delay ?? delayTimeout ?? 600;

  const [value, setValue] = useState(valueProp ?? "");

  // Always points at the value currently shown in the input, so blur/flush
  // never reads stale React state (fixes the 1.x async-setState race).
  const valueRef = useRef(value);
  valueRef.current = value;

  // Apply the minLength rule and notify the parent. Guards a missing callback.
  const notify = useCallback(
    (next: string) => {
      const emitted = next.length >= minLength ? next : "";
      onChangeText?.(emitted);
    },
    [minLength, onChangeText],
  );

  const debounced = useDebouncedCallback(notify, resolvedDelay);

  const handleChangeText = useCallback(
    (next: string) => {
      setValue(next);
      debounced.run(next);
    },
    [debounced],
  );

  const handleBlur = useCallback(
    (event: Parameters<NonNullable<TextInputProps["onBlur"]>>[0]) => {
      // Commit the latest text immediately rather than waiting for the timer.
      debounced.flush();
      onBlurProp?.(event);
    },
    [debounced, onBlurProp],
  );

  // Hybrid controlled/uncontrolled: mirror keystrokes locally for instant
  // feedback, but sync (and drop any pending debounce) when the parent changes
  // `value` externally (fixes the 1.x "stuck value" bug).
  const prevValueProp = useRef(valueProp);
  useEffect(() => {
    if (valueProp !== undefined && valueProp !== prevValueProp.current) {
      prevValueProp.current = valueProp;
      if (valueProp !== valueRef.current) {
        debounced.cancel();
        setValue(valueProp);
      }
    } else {
      prevValueProp.current = valueProp;
    }
  }, [valueProp, debounced]);

  // Forward the instance to both `ref` and the legacy `inputRef`.
  const setInputRef = useMemo(
    () => (instance: TextInput | null) => {
      assignRef(ref, instance);
      assignRef(inputRef, instance);
    },
    [ref, inputRef],
  );

  return (
    <TextInput
      {...textInputProps}
      ref={setInputRef}
      value={value}
      onChangeText={handleChangeText}
      onBlur={handleBlur}
    />
  );
});

export const DelayInput = memo(DelayInputInner);
DelayInput.displayName = "DelayInput";

export default DelayInput;
