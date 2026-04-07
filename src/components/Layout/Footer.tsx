
import { ExchangeRateUpdater } from "../pos/ExchangeRateUpdater";

export function Footer() {
  return (
  <footer className="border-t border-border bg-gradient-to-r from-[#FF7A1A] via-[#FF8F33] to-[#FFB047] h-auto py-4 px-4 text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <p className="text-sm text-foreground text-center md:text-right">
          Desarrollado por Arrau Technology © {new Date().getFullYear()}
        </p>
        <div className="text-sm text-foreground text-center md:text-right">
          Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
