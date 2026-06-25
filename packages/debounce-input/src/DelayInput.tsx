import { forwardRef, memo, useCallback, useEffect, useRef, useState } from "react";
import { TextInput } from "react-native";
import type { TextInputProps } from "react-native";

import { useDebouncedCallback } from "./useDebouncedCallback";

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
}

const DelayInputInner = forwardRef<TextInput, DelayInputProps>(function DelayInput(
  {
    onChangeText,
    delay = 600,
    minLength = 3,
    value: valueProp,
    onBlur: onBlurProp,
    ...textInputProps
  },
  ref,
) {
  const [value, setValue] = useState(valueProp ?? "");

  // Always points at the value currently shown in the input, so blur/flush
  // never reads stale React state.
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

  const debounced = useDebouncedCallback(notify, delay);

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
  // `value` externally.
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

  return (
    <TextInput
      {...textInputProps}
      ref={ref}
      value={value}
      onChangeText={handleChangeText}
      onBlur={handleBlur}
    />
  );
});

export const DelayInput = memo(DelayInputInner);
DelayInput.displayName = "DelayInput";

export default DelayInput;
