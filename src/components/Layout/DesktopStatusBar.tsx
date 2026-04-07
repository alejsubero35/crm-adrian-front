import React from "react";
import { cn } from "@/lib/utils";

type Shortcut = {
  key?: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

interface DesktopStatusBarProps {
  // Context
  registerName?: string | null;
  userName?: string | null;
  customerName?: string | null;
  exchangeRate?: number | null;
  isOnline?: boolean;
  pendingCount?: number;

  // Actions (wired to Index handlers)
  onOpenPendingSales: () => void;
  onSavePendingSale: () => void;
  onProcessPayment: () => void;
  onCancelPayment: () => void;
  onSelectPaymentUSD: () => void;
  onSelectPaymentBS: () => void;
  onSelectPaymentMovil: () => void;
  onSelectPaymentBiopago: () => void;
  onSelectPaymentDebito: () => void;
  onPayFull: () => void;
  onFocusSearch: () => void;

  // State for enabling/disabling some actions
  canProcess?: boolean;
  canSavePending?: boolean;

  // Layout variant: fixed global footer or embedded inside a panel
  variant?: "global" | "embedded";
}

export function DesktopStatusBar({
  registerName,
  userName,
  customerName,
  exchangeRate,
  isOnline = true,
  pendingCount = 0,
  onOpenPendingSales,
  onSavePendingSale,
  onProcessPayment,
  onCancelPayment,
  onSelectPaymentUSD,
  onSelectPaymentBS,
  onSelectPaymentMovil,
  onSelectPaymentBiopago,
  onSelectPaymentDebito,
  onPayFull,
  onFocusSearch,
  canProcess = true,
  canSavePending = true,
  variant = "global",
}: DesktopStatusBarProps) {
  // Keep an internal online state that follows navigator.onLine and also
  // mirrors the incoming prop. This ensures the footer updates when the
  // browser fires online/offline events even if the parent doesn't update the prop.
  const [online, setOnline] = React.useState<boolean>(() => {
    if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") return navigator.onLine;
    return Boolean(isOnline);
  });

  // Sync when prop changes
  React.useEffect(() => {
    setOnline(Boolean(isOnline));
  }, [isOnline]);

  // Listen to browser online/offline events
  React.useEffect(() => {
    function handleOnline() {
      setOnline(true);
    }
    function handleOffline() {
      setOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  const shortcuts: Shortcut[] = [
    // Atajos de métodos de pago (teclas sin conflictos con el navegador)
    { key: "F2", label: "Bs", onClick: onSelectPaymentBS, disabled: !canSavePending },
    { key: "F3", label: "USD", onClick: onSelectPaymentUSD, disabled: !canSavePending },
    { key: "F8", label: "Débito", onClick: onSelectPaymentDebito, disabled: !canSavePending },
    { key: "F5", label: "P. Móvil", onClick: onSelectPaymentMovil, disabled: !canSavePending },
    { key: "F6", label: "Biopago", onClick: onSelectPaymentBiopago, disabled: !canSavePending },

    // Monto completo para el método seleccionado
    { key: "F4", label: "M.Total", onClick: onPayFull, disabled: !canSavePending },

    // Acciones de flujo de cobro
    { key: "F9", label: "Procesar", onClick: onProcessPayment, disabled: !canProcess },
    /* { key: "Esc", label: "Cancelar pago", onClick: onCancelPayment }, */
  ];

  return (
    <div
      className={cn(
        "flex h-12 items-center justify-between bg-white/80 backdrop-blur border-t ring-1 ring-gray-100 px-4 font-bold",
        variant === "global" && "hidden lg:flex fixed inset-x-0 bottom-0 z-40",
        variant === "embedded" && "w-full"
      )}
    >
      {/* Left: Context (oculto por ahora, se dejan solo los botones) */}
      {false && (
        <div className="min-w-0 flex items-center gap-3 text-sm text-gray-600">
          {registerName && (
            <div className="truncate">
              <span className="text-gray-500">Caja:</span> <span className="font-bold text-gray-800">{registerName}</span>
            </div>
          )}
          {userName && (
            <div className="truncate hidden xl:block">
              <span className="text-gray-500">Vendedor:</span> <span className="text-gray-700">{userName}</span>
            </div>
          )}
          <div className={cn("hidden xl:flex items-center gap-1", !customerName && "text-amber-700")}>
            <span className="text-gray-500">Cliente:</span> <span className={cn("truncate max-w-[220px]", !customerName && "text-amber-700")}>{customerName || "Sin cliente"}</span>
          </div>
          {exchangeRate != null && (
            <div className="hidden md:flex items-center">
              <span className="text-gray-500">Tasa:</span>
              <span className="ml-1 text-gray-700">{exchangeRate}</span>
            </div>
          )}
        </div>
      )}

      {/* Center: Shortcuts legend (scrollable if overflows) */}
      <div className="flex-1 flex items-center justify-center overflow-x-auto">
        <div className="flex items-center gap-2">
          {shortcuts.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={s.onClick}
              disabled={s.disabled}
              className={cn(
                "inline-flex items-center gap-2 h-8 px-3 rounded-md border text-xs transition font-bold",
                // Botones sólidos con color de marca
                "bg-brand-orange text-white border-brand-orange hover:bg-brand-orange-2",
                s.disabled && "opacity-50 cursor-not-allowed"
              )}
              title={s.key ? `Atajo: ${s.key}` : undefined}
            >
              {s.key && (
                <kbd className="inline-flex items-center justify-center h-6 min-w-[2ch] px-1 rounded bg-white/20 border border-white/30 text-white text-[11px]">
                  {s.key}
                </kbd>
              )}
              <span className="whitespace-nowrap">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Indicators (ocultos, se mantienen solo los botones de atajos) */}
      {false && (
        <div className="min-w-0 flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <span className={cn("inline-block h-2.5 w-2.5 rounded-full", online ? "bg-emerald-500" : "bg-rose-500")} />
            <span className="hidden sm:inline">{online ? "Conectado" : "Sin conexión"}</span>
          </div>
          {/*  <button
            onClick={onOpenPendingSales}
            className="inline-flex items-center gap-2 h-8 px-2.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs hover:bg-amber-100"
            title="Ver ventas pendientes (F4)"
          >
            <span className="hidden sm:inline">Pendientes</span>
            <span className="inline-flex items-center justify-center min-w-[22px] h-5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[11px]">
              {pendingCount}
            </span>
          </button> */}
        </div>
      )}
    </div>
  );
}

export default DesktopStatusBar;
