import { useEffect, useState } from "react";

/** Minimal toast: one module-level channel, one host. No context, no portal library. */

type Listener = (message: string) => void;
let listeners: Listener[] = [];
let seq = 0;

export function toast(message: string): void {
  for (const l of listeners) l(message);
}

export function ToastHost() {
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);

  useEffect(() => {
    const onToast: Listener = (message) => {
      const id = ++seq;
      setToasts((t) => [...t, { id, message }]);
      window.setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 2600);
    };
    listeners.push(onToast);
    return () => {
      listeners = listeners.filter((l) => l !== onToast);
    };
  }, []);

  return (
    <div className="toast-host" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.message}
        </div>
      ))}
    </div>
  );
}
