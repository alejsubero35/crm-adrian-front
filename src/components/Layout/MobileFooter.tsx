import { SlidersHorizontal, Store, Home, Printer, User } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';

export function MobileFooter() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToProducts = () => navigate('/pos/products');
  const goToClients = () => {
    try {
      navigate('/pos/clients');
    } catch (e) {
      window.dispatchEvent(new CustomEvent('pos:openClients'));
    }
  };
  const goToClosure = () => {
    try {
      navigate('/reports/daily');
    } catch (e) {
      window.dispatchEvent(new CustomEvent('pos:openClosure'));
    }
  };

  const goToInventoryAdjustments = () => navigate('/ajustes-inventario');

  const isActive = (path: string | string[]) => {
    const paths = Array.isArray(path) ? path : [path];
    return paths.some(p => p === '/' ? location.pathname === '/' : location.pathname.startsWith(p));
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 rounded-t-2xl shadow-[0_-2px_10px_rgba(0,0,0,0.06)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-screen-sm mx-auto px-4 py-3">
        <nav className="grid grid-cols-5 items-end">
          {/* Home */}
          <button
            onClick={() => navigate('/dashboard')}
            className="mx-1 flex flex-col items-center gap-1 px-3 py-1 text-[11px] transition-colors"
          >
            <div className={`h-8 w-12 rounded-full flex items-center justify-center ${isActive('/dashboard') ? 'bg-orange-50' : ''}`}>
              <Home className={`h-5 w-5 ${isActive('/dashboard') ? 'text-brand-orange' : 'text-gray-500'}`} />
            </div>
            <span className={`text-gray-500 ${isActive('/dashboard') ? 'font-extrabold' : 'font-normal'}`}>Inicio</span>
          </button>

          {/* Clientes */}
          <button
            onClick={goToClients}
            className="mx-1 flex flex-col items-center gap-1 px-3 py-1 text-[11px] transition-colors"
          >
            <div className={`h-8 w-12 rounded-full flex items-center justify-center ${isActive('/pos/clients') ? 'bg-orange-50' : ''}`}>
              <User className={`h-5 w-5 ${isActive('/pos/clients') ? 'text-brand-orange' : 'text-gray-500'}`} />
            </div>
            <span className={`text-gray-500 ${isActive('/pos/clients') ? 'font-extrabold' : 'font-normal'}`}>Clientes</span>
          </button>

          {/* TPV central como botón circular elevado (icono solo) */}
          <button
            onClick={scrollToProducts}
            className="mx-1 flex flex-col items-center gap-0 text-[11px]"
            aria-label="TPV"
          >
            <div className={`-mt-12 flex items-center justify-center h-16 w-16 rounded-full bg-brand-orange text-white shadow-[0_10px_22px_rgba(0,0,0,0.18)] ring-1 ring-orange-200/70 transition-colors hover:bg-brand-orange-2`}>
              <Store className="h-7 w-7" />
            </div>
            {/* sin etiqueta para mantener el centro limpio */}
          </button>

          {/* Ajuste de inventario */}
          <button
            onClick={goToInventoryAdjustments}
            className="relative mx-1 flex flex-col items-center gap-1 px-3 py-1 text-[11px] transition-colors"
          >
            <div className={`h-8 w-12 rounded-full flex items-center justify-center ${isActive('/ajustes-inventario') ? 'bg-orange-50' : ''}`}>
              <SlidersHorizontal className={`h-5 w-5 ${isActive('/ajustes-inventario') ? 'text-brand-orange' : 'text-gray-500'}`} />
            </div>
            <span className={`text-gray-500 ${isActive('/ajustes-inventario') ? 'font-extrabold' : 'font-normal'}`}>Ajustes</span>
          </button>

          {/* Cierre */}
          <button
            onClick={goToClosure}
            className="mx-1 flex flex-col items-center gap-1 px-3 py-1 text-[11px] transition-colors"
          >
            <div className={`h-8 w-12 rounded-full flex items-center justify-center ${isActive(['/reports', '/reports/daily']) ? 'bg-orange-50' : ''}`}>
              <Printer className={`h-5 w-5 ${isActive(['/reports', '/reports/daily']) ? 'text-brand-orange' : 'text-gray-500'}`} />
            </div>
            <span className={`text-gray-500 ${isActive(['/reports', '/reports/daily']) ? 'font-extrabold' : 'font-normal'}`}>Cierre</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

// Provide both named and default export for compatibility with existing imports
export default MobileFooter;