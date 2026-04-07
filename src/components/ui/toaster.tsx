import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const variant = (props as any)?.variant ?? "default"
        const iconMap: Record<string, JSX.Element> = {
          success: <CheckCircle2 className="h-7 w-7 text-emerald-600" strokeWidth={2.5} />,
          destructive: <XCircle className="h-7 w-7 text-red-600" strokeWidth={2.5} />,
          warning: <AlertTriangle className="h-7 w-7 text-amber-600" strokeWidth={2.5} />,
          default: <Info className="h-7 w-7 text-slate-600" strokeWidth={2.5} />,
        }
        const icon = iconMap[variant] ?? iconMap.default
        return (
          <Toast key={id} {...props} className="min-w-[360px] max-w-[420px]">
            <div className="flex items-center gap-3 pr-6 w-full">
              <div className="flex items-center justify-center shrink-0 rounded-full bg-white/70 p-1.5 shadow-sm border border-transparent">
                {icon}
              </div>
              <div className="space-y-1 text-sm flex-1">
                {title && <ToastTitle className="leading-tight">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="leading-snug text-[13px] text-slate-700">
                    {description}
                  </ToastDescription>
                )}
                {action}
              </div>
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
