import React from 'react';
import { Download, X } from 'lucide-react';
import { useInstallPrompt, INSTALL_DISMISSED_KEY } from '../hooks/useInstallPrompt';

/**
 * Offers "Add to Home Screen" once the browser reports the app is installable.
 * Dismissal is remembered so the banner does not nag on every visit.
 */
export const InstallPrompt: React.FC = () => {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = React.useState(
    () => localStorage.getItem(INSTALL_DISMISSED_KEY) === '1'
  );

  if (!canInstall || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
    } catch {}
  };

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-[calc(var(--bottom-nav-clearance)+12px)] z-[55] w-[calc(100%-24px)] max-w-sm">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card-bg border border-card-border shadow-card backdrop-blur-xl">
        <Download size={18} className="text-accent shrink-0" />
        <p className="flex-1 text-xs text-text leading-tight">
          Pasang Pitbull Fit di layar utama untuk akses cepat dan mode offline.
        </p>
        <button
          type="button"
          onClick={() => {
            void promptInstall().then((accepted) => {
              if (accepted) dismiss();
            });
          }}
          className="px-3 py-1.5 rounded-lg bg-accent text-on-accent text-xs font-bold"
        >
          Pasang
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Tutup"
          className="text-text-muted hover:text-text"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
