import React from 'react';

interface LoadingOverlayProps {
  show: boolean;
  title?: string;
  message?: string;
  // Optional class overrides
  backdropClassName?: string;
  contentClassName?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  title = 'CARGANDO',
  message,
  backdropClassName,
  contentClassName,
  fullScreen = true,
}) => {
  if (!show) return null;
  const containerClass = fullScreen ? 'fixed inset-0' : 'absolute inset-0';
  return (
    <div
      className={`${containerClass} ${fullScreen ? 'z-[2147483647]' : 'z-20'} flex items-center justify-center ${backdropClassName ?? 'bg-slate-900/40 backdrop-blur-sm'}`}
    >
      <div
        className={
          "flex flex-col items-center text-center px-6 " +
          (contentClassName ?? '')
        }
      >
        <div className="mb-4 flex items-center justify-center">
          <img
            src="/img/ms-icon-310x310.png"
            alt="Logo Venta Simplyfy"
            className="h-20 w-20 object-contain drop-shadow-[0_0_18px_rgba(15,23,42,0.55)] logo-fade-in"
          />
        </div>

        {title ? (
          <h2 className="text-sm sm:text-base font-semibold tracking-[0.18em] uppercase text-slate-900 drop-shadow-sm">
            {title}
          </h2>
        ) : null}

        {message ? (
          <p className="mt-3 max-w-md text-xs sm:text-sm text-slate-700/90">{message}</p>
        ) : null}
      </div>
    </div>
  );
};
