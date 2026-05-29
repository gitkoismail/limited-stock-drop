import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCountdown } from "../hooks/useCountdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should calculate remaining seconds from expiresAt", () => {
    const expiresAt = new Date("2026-01-01T00:05:00.000Z").toISOString();

    const { result } = renderHook(() => useCountdown(expiresAt));

    expect(result.current).toBe(300);
  });

  it("should decrease remaining seconds over time", () => {
    const expiresAt = new Date("2026-01-01T00:05:00.000Z").toISOString();

    const { result } = renderHook(() => useCountdown(expiresAt));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe(299);
  });

  it("should not return negative values after expiration", () => {
    const expiresAt = new Date("2026-01-01T00:00:01.000Z").toISOString();

    const { result } = renderHook(() => useCountdown(expiresAt));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current).toBe(0);
  });
});