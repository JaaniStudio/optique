"use client";

import { Toast, ToastClose, ToastTitle, useToast, ToastViewport } from "@/components/ui/toast";

export function ToastHost() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastViewport>
      {toasts.map((t, i) => (
        <Toast
          key={`${t.title}-${i}`}
          variant={t.variant}
          duration={4000}
          onOpenChange={(open: boolean) => { if (!open) dismiss(t); }}
        >
          <div className="flex-1">
            <ToastTitle>{t.title}</ToastTitle>
            {t.description ? (
              <p className="mt-0.5 text-xs opacity-80">{t.description}</p>
            ) : null}
          </div>
          <ToastClose />
        </Toast>
      ))}
    </ToastViewport>
  );
}