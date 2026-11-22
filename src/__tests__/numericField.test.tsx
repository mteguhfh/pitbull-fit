// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNumericField } from '../hooks/useNumericField';

const opts = { min: 100, max: 250, fallback: 175 };

describe('useNumericField', () => {
  it('lets the field be cleared instead of snapping to the minimum', () => {
    const { result } = renderHook(() => useNumericField(175, opts));

    act(() => result.current.onChange(''));

    expect(result.current.text).toBe('');
  });

  it('accepts a partially typed number without clamping mid-typing', () => {
    const { result } = renderHook(() => useNumericField(175, opts));

    act(() => result.current.onChange('17'));

    expect(result.current.text).toBe('17');
  });

  it('clamps to the allowed range on commit', () => {
    const { result } = renderHook(() => useNumericField(175, opts));

    act(() => result.current.onChange('17'));
    let committed = 0;
    act(() => {
      committed = result.current.commit();
    });

    expect(committed).toBe(100);
    expect(result.current.text).toBe('100');
  });

  it('restores the fallback when committed while empty', () => {
    const { result } = renderHook(() => useNumericField(175, opts));

    act(() => result.current.onChange(''));
    let committed = 0;
    act(() => {
      committed = result.current.commit();
    });

    expect(committed).toBe(175);
  });

  it('keeps decimals for weight and strips stray characters', () => {
    const { result } = renderHook(() =>
      useNumericField(70, { min: 30, max: 300, fallback: 70, decimal: true })
    );

    act(() => result.current.onChange('72,5'));
    expect(result.current.text).toBe('725');

    act(() => result.current.onChange('72.5'));
    let committed = 0;
    act(() => {
      committed = result.current.commit();
    });
    expect(committed).toBe(72.5);
  });

  it('follows external value changes such as a kg to lbs toggle', () => {
    const { result, rerender } = renderHook(({ value }) => useNumericField(value, opts), {
      initialProps: { value: 175 }
    });

    act(() => result.current.onChange('180'));
    rerender({ value: 200 });

    expect(result.current.text).toBe('200');
  });

  it('ignores non numeric input', () => {
    const { result } = renderHook(() => useNumericField(175, opts));

    act(() => result.current.onChange('abc'));
    expect(result.current.text).toBe('');

    act(() => result.current.onChange('-'));
    expect(result.current.text).toBe('');
  });
});
