import React from "react";

interface LogoOverlayProps {
  /** Si es false, no se renderiza el overlay */
  open?: boolean;
  /** Título principal, por ejemplo: "PROCESANDO PAGO" */
  title?: string;
  /** Mensaje secundario debajo del título */
  message?: string;
}

/**
 * Overlay de pantalla completa con el logo centrado.
 * - Fondo desenfocado con capa oscura suave.
 * - Logo dentro de un círculo con ligero glow.
 * - Título y texto descriptivo opcionales.
 * Pensado para usarse en autenticación, procesamiento de pago, etc.
 */
export const LogoOverlay: React.FC<LogoOverlayProps> = ({
  open = false,
  title,
  message,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="flex flex-col items-center text-center px-6">
        <div className="mb-6 flex items-center justify-center">
          <img
            src="/img/ms-icon-310x310.png"
            alt="Logo Venta Simplyfy"
            className="h-20 w-20 object-contain drop-shadow-[0_0_18px_rgba(15,23,42,0.55)] logo-fade-in"
          />
        </div>

        {title && (
          <h2 className="text-sm sm:text-base font-semibold tracking-[0.18em] uppercase text-slate-900 drop-shadow-sm">
            {title}
          </h2>
        )}

        {message && (
          <p className="mt-3 max-w-md text-xs sm:text-sm text-slate-700/90">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};
