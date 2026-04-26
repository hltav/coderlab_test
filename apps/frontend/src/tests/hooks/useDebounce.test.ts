import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebounce } from "../../hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("deve retornar o valor inicial imediatamente", () => {
    const { result } = renderHook(() => useDebounce("inicial", 400));
    expect(result.current).toBe("inicial");
  });

  it("não deve atualizar o valor antes do delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      { initialProps: { value: "inicial" } },
    );

    rerender({ value: "atualizado" });

    act(() => {
      vi.advanceTimersByTime(399);
    });

    expect(result.current).toBe("inicial");
  });

  it("deve atualizar o valor após o delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      { initialProps: { value: "inicial" } },
    );

    rerender({ value: "atualizado" });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe("atualizado");
  });

  it("deve resetar o timer a cada mudança de valor", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe("c");
  });

  it("deve respeitar delay customizado", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 1000),
      { initialProps: { value: "inicial" } },
    );

    rerender({ value: "atualizado" });

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(result.current).toBe("inicial");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("atualizado");
  });

  it("deve funcionar com tipos diferentes de valor", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      { initialProps: { value: 0 } },
    );

    rerender({ value: 42 });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe(42);
  });
});
