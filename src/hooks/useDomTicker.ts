import { useEffect, useRef } from 'react';

/**
 * Writes a mm:ss string straight into the DOM once per second.
 * A React state tick here would re-render every set row on the screen
 * once a second, which is the usual source of micro-stutter while training.
 */
export function useDomTicker(
  getElapsedSeconds: () => number,
  options?: { pauseWhenHidden?: boolean }
) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const pauseWhenHidden = options?.pauseWhenHidden ?? true;

  useEffect(() => {
    let frame = 0;
    let lastSecond = -1;

    const paint = () => {
      const el = ref.current;
      if (!el) return;
      const total = Math.max(0, Math.floor(getElapsedSeconds()));
      if (total === lastSecond) return;
      lastSecond = total;
      const mm = Math.floor(total / 60).toString().padStart(2, '0');
      const ss = (total % 60).toString().padStart(2, '0');
      el.textContent = `${mm}:${ss}`;
    };

    const loop = () => {
      paint();
      frame = window.requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      window.cancelAnimationFrame(frame);
      if (!document.hidden || !pauseWhenHidden) loop();
    };

    loop();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [getElapsedSeconds, pauseWhenHidden]);

  return ref;
}
