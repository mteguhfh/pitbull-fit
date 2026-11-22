import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

export const UPDATE_EVENT = 'pitbull:update-available';

/**
 * Shown when a newer service worker is waiting. Without this the app can keep
 * running an old build until the user clears the cache by hand.
 */
export const UpdateToast: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const onUpdate = () => setVisible(true);
    window.addEventListener(UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(UPDATE_EVENT, onUpdate);
  }, []);

  useEffect(() => {
    if (!applying) return;
    const onControllerChange = () => window.location.reload();
    navigator.serviceWorker?.addEventListener('controllerchange', onControllerChange);
    return () => navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange);
  }, [applying]);

  if (!visible) return null;

  const applyUpdate = async () => {
    setApplying(true);
    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    } catch {
      window.location.reload();
    }
  };

  return (
    <div
      role="status"
      className="fixed left-1/2 -translate-x-1/2 bottom-[calc(var(--bottom-nav-clearance)+12px)] z-[60] w-[calc(100%-24px)] max-w-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card-bg border border-card-border shadow-card backdrop-blur-xl">
        <RefreshCw size={18} className="text-accent shrink-0" />
        <p className="flex-1 text-xs text-text leading-tight">
          Versi baru tersedia. Muat ulang untuk memakai update terbaru.
        </p>
        <button
          type="button"
          onClick={applyUpdate}
          disabled={applying}
          className="px-3 py-1.5 rounded-lg bg-accent text-on-accent text-xs font-bold disabled:opacity-60"
        >
          {applying ? 'Memuat…' : 'Muat ulang'}
        </button>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Tutup"
          className="text-text-muted hover:text-text"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
