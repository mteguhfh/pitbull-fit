import React from 'react';
import { clearAppStorage } from '../utils/storage';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last line of defence: a render crash shows a recoverable screen instead of a blank page.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled render error', error, info.componentStack);
  }

  private reload = () => {
    window.location.reload();
  };

  private resetLocalData = () => {
    const confirmed = window.confirm(
      'Semua data latihan yang tersimpan di perangkat ini akan dihapus. Lanjutkan?'
    );
    if (!confirmed) return;
    clearAppStorage();
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/12 border border-accent/30 flex items-center justify-center">
            <span className="text-accent text-2xl font-black">!</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-lg font-black tracking-tight">Aplikasi berhenti tak terduga</h1>
            <p className="text-sm text-text-muted">
              Data latihan kamu tetap aman. Coba muat ulang dulu. Kalau masih gagal, reset data lokal
              akan mengembalikan aplikasi ke kondisi awal.
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={this.reload}
              className="w-full py-3 rounded-xl bg-accent text-on-accent font-bold text-sm active:scale-[0.99] transition"
            >
              Muat ulang
            </button>
            <button
              type="button"
              onClick={this.resetLocalData}
              className="w-full py-3 rounded-xl border border-line-strong text-text-muted font-semibold text-sm hover:text-text transition"
            >
              Reset data lokal
            </button>
          </div>

          <details className="text-left">
            <summary className="text-[11px] text-text-muted cursor-pointer">Detail teknis</summary>
            <pre className="mt-2 p-3 rounded-lg bg-surface text-[10px] font-mono text-text-muted overflow-auto max-h-40 whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
