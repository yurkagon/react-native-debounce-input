import { createRef, useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TextInput } from "react-native";

import { DelayInput } from "./DelayInput";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
const getInput = () => screen.getByRole("textbox") as HTMLInputElement;
const type = (text: string) => fireEvent.change(getInput(), { target: { value: text } });

describe("DelayInput", () => {
  it("debounces onChangeText until the delay elapses", () => {
    const onChangeText = vi.fn();
    render(<DelayInput onChangeText={onChangeText} delay={600} minLength={3} />);

    type("abc");
    expect(onChangeText).not.toHaveBeenCalled();

    advance(599);
    expect(onChangeText).not.toHaveBeenCalled();

    advance(1);
    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenLastCalledWith("abc");
  });

  it("reflects typing in the input immediately (no lag)", () => {
    render(<DelayInput onChangeText={vi.fn()} />);
    type("hello");
    expect(getInput().value).toBe("hello");
  });

  it("emits an empty string when shorter than minLength", () => {
    const onChangeText = vi.fn();
    render(<DelayInput onChangeText={onChangeText} delay={600} minLength={3} />);

    type("ab");
    advance(600);
    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenLastCalledWith("");
  });

  it("only fires once for the final value when typing rapidly", () => {
    const onChangeText = vi.fn();
    render(<DelayInput onChangeText={onChangeText} delay={600} minLength={1} />);

    type("a");
    advance(300);
    type("ab");
    advance(300);
    type("abc");
    advance(600);

    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenLastCalledWith("abc");
  });

  it("flushes the current value immediately on blur (regression: stale state)", () => {
    const onChangeText = vi.fn();
    render(<DelayInput onChangeText={onChangeText} delay={600} minLength={3} />);

    type("hello");
    fireEvent.blur(getInput());

    // Fires synchronously on blur, with the value just typed.
    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenLastCalledWith("hello");
  });

  it("syncs an externally changed value prop into the input (regression: stuck value)", () => {
    function Harness() {
      const [value, setValue] = useState("initial");
      return (
        <>
          <DelayInput value={value} onChangeText={vi.fn()} minLength={1} />
          <button onClick={() => setValue("external")}>set</button>
        </>
      );
    }
    render(<Harness />);
    expect(getInput().value).toBe("initial");

    act(() => {
      fireEvent.click(screen.getByText("set"));
    });
    expect(getInput().value).toBe("external");
  });

  it("does not clobber active typing when the value prop is unchanged", () => {
    render(<DelayInput value="seed" onChangeText={vi.fn()} minLength={1} />);
    type("typed by user");
    expect(getInput().value).toBe("typed by user");
  });

  it("does not fire a pending timer after unmount (regression: timer leak)", () => {
    const onChangeText = vi.fn();
    const { unmount } = render(
      <DelayInput onChangeText={onChangeText} delay={600} minLength={1} />,
    );

    type("abc");
    unmount();
    advance(600);

    expect(onChangeText).not.toHaveBeenCalled();
  });

  it("never throws when onChangeText is omitted", () => {
    // @ts-expect-error onChangeText is required by the types; verifying runtime safety.
    render(<DelayInput delay={100} minLength={1} />);
    type("abc");
    expect(() => advance(100)).not.toThrow();
  });

  it("forwards ref to the underlying input", () => {
    const ref = createRef<TextInput>();
    render(<DelayInput ref={ref} onChangeText={vi.fn()} />);
    expect(ref.current).not.toBeNull();
  });

  describe("backward-compatible 1.x props", () => {
    it("honors the deprecated delayTimeout alias", () => {
      const onChangeText = vi.fn();
      render(<DelayInput onChangeText={onChangeText} delayTimeout={300} minLength={1} />);

      type("abc");
      advance(299);
      expect(onChangeText).not.toHaveBeenCalled();
      advance(1);
      expect(onChangeText).toHaveBeenCalledTimes(1);
      expect(onChangeText).toHaveBeenLastCalledWith("abc");
    });

    it("honors the deprecated inputRef prop", () => {
      const inputRef = createRef<TextInput>();
      render(<DelayInput inputRef={inputRef} onChangeText={vi.fn()} />);
      expect(inputRef.current).not.toBeNull();
    });
  });
});
