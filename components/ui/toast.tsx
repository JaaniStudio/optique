"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 right-4 z-[100] flex max-h-screen flex-col-reverse gap-2 w-full max-w-sm",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
  variant?: "default" | "destructive" | "success";
};

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-white border border-ink/10 text-ink",
    destructive: "bg-red-600 text-white border-red-700",
    success: "bg-green-700 text-white border-green-800",
  };
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        "rounded-lg px-4 py-3 shadow-lg text-sm flex items-center justify-between gap-3",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn("opacity-60 hover:opacity-100 transition-opacity", className)}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn("font-medium", className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

type ToastAction = {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

let toastListeners: Array<(toast: ToastAction) => void> = [];

export function toast(action: ToastAction) {
  toastListeners.forEach((listener) => listener(action));
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastAction[]>([]);

  React.useEffect(() => {
    const listener = (t: ToastAction) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x !== t));
      }, 4000);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const dismiss = (t: ToastAction) => {
    setToasts((prev) => prev.filter((x) => x !== t));
  };

  return { toasts, dismiss };
}

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastClose,
  ToastTitle,
};
