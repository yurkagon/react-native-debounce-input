import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebouncedCallback } from "./useDebouncedCallback";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebouncedCallback", () => {
  it("invokes the callback once after the delay", () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(cb, 500));

    result.current.run("a");
    result.current.run("b");
    vi.advanceTimersByTime(500);

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenLastCalledWith("b");
  });

  it("keeps a stable handle identity across renders", () => {
    const { result, rerender } = renderHook(
      ({ cb }: { cb: () => void }) => useDebouncedCallback(cb, 500),
      { initialProps: { cb: vi.fn() } },
    );
    const first = result.current;
    rerender({ cb: vi.fn() });
    expect(result.current).toBe(first);
  });

  it("uses the latest callback when the timer fires", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(
      ({ cb }: { cb: (arg: string) => void }) => useDebouncedCallback(cb, 500),
      { initialProps: { cb: first } },
    );

    result.current.run("x");
    rerender({ cb: second });
    vi.advanceTimersByTime(500);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenLastCalledWith("x");
  });

  it("flush invokes immediately with the pending args and cancels the timer", () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(cb, 500));

    result.current.run("pending");
    result.current.flush();
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenLastCalledWith("pending");

    vi.advanceTimersByTime(500);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("flush is a no-op when nothing is pending", () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(cb, 500));
    result.current.flush();
    expect(cb).not.toHaveBeenCalled();
  });

  it("cancel prevents a pending invocation", () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(cb, 500));

    result.current.run("x");
    result.current.cancel();
    vi.advanceTimersByTime(500);

    expect(cb).not.toHaveBeenCalled();
  });

  it("does not fire after unmount", () => {
    const cb = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(cb, 500));

    result.current.run("x");
    unmount();
    vi.advanceTimersByTime(500);

    expect(cb).not.toHaveBeenCalled();
  });
});
