import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      // 手機：頂部全寬；桌面：右下角浮動
      "fixed left-1/2 top-[calc(env(safe-area-inset-top)+12px)] z-[100] flex max-h-screen w-[min(92vw,420px)] -translate-x-1/2 flex-col-reverse gap-3 px-0",
      "sm:left-auto sm:right-6 sm:top-auto sm:bottom-6 sm:translate-x-0 sm:flex-col",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

// 便利貼風格（cork 布告欄調色） — 取消邊框、改用紙質背景 + 立體圖釘陰影
const toastVariants = cva(
  cn(
    "group pointer-events-auto relative flex w-full items-start gap-3 overflow-visible",
    "rounded-[10px] pl-12 pr-9 py-4 sm:py-[18px]",
    "transition-all",
    "data-[swipe=cancel]:translate-x-0",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=move]:transition-none",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[swipe=end]:animate-out data-[state=closed]:fade-out-80",
    "data-[state=closed]:slide-out-to-right-full",
    "data-[state=open]:slide-in-from-top-full",
    "data-[state=open]:sm:slide-in-from-bottom-full"
  ),
  {
    variants: {
      variant: {
        default: "akai-toast-success",
        destructive: "destructive akai-toast-error",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
  VariantProps<typeof toastVariants> & { children?: React.ReactNode }
>(({ className, variant, children, style, ...props }, ref) => {
  const isError = variant === "destructive"
  // 便利貼底色 + 圖釘色（對齊 tokens.css 與 OG 圖配色）
  const noteBg = isError ? "var(--note-pink)" : "var(--note-green)"
  const noteEdge = isError ? "rgba(220,38,38,0.18)" : "rgba(22,163,74,0.20)"
  const pinColor = isError ? "var(--pin-red)" : "var(--pin-green)"
  const tilt = isError ? "-1.2deg" : "0.8deg"

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      style={{
        background: `linear-gradient(135deg, ${noteBg} 0%, color-mix(in srgb, ${noteBg} 88%, white) 100%)`,
        color: "var(--ink)",
        boxShadow: `0 2px 3px rgba(0,0,0,.12), 4px 5px 0 rgba(0,0,0,.16), 0 16px 28px -10px rgba(0,0,0,.32)`,
        border: `1px solid ${noteEdge}`,
        transform: `rotate(${tilt})`,
        fontFamily: "var(--font-tc)",
        ...style,
      }}
      {...props}
    >
      {/* 立體圖釘（左上角） */}
      <span
        aria-hidden
        className="absolute left-3 top-3 h-4 w-4 rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${pinColor} 60%, white) 0%, ${pinColor} 55%, color-mix(in srgb, ${pinColor} 70%, black) 100%)`,
          boxShadow: `0 1px 0 rgba(255,255,255,0.5) inset, 0 2px 4px rgba(0,0,0,0.35), 0 0 0 1.5px rgba(255,255,255,0.4)`,
        }}
      />
      {children}
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border-2 border-dashed bg-white/40 px-3 text-sm font-semibold transition-colors hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    style={{ borderColor: "var(--ink-soft)", color: "var(--ink)" }}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-full p-1.5 transition-all hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1",
      // 桌面 hover 才顯示；手機常駐 60% 不透明（觸控找不到 hover）
      "opacity-60 sm:opacity-0 sm:group-hover:opacity-90 group-focus-within:opacity-90",
      className
    )}
    style={{ color: "var(--ink-soft)" }}
    toast-close=""
    aria-label="關閉提示"
    {...props}
  >
    <X className="h-3.5 w-3.5" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(
      "text-[15px] sm:text-base font-bold leading-snug tracking-wide",
      className
    )}
    style={{ color: "var(--ink)" }}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-[13px] sm:text-sm leading-relaxed mt-0.5", className)}
    style={{ color: "var(--ink-soft)" }}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
