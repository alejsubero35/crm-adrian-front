import { Button } from "@/components/ui/button";
import { useUserContext } from "@/hooks/useUserContext";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Bell, ShoppingCart, User, ChevronsLeft, ChevronsRight, LayoutDashboard, Monitor, Globe2, Maximize2, Mail, Settings, Clock3, Languages } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartSheet } from "./CartSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCart } from "@/contexts/CartContext";
import { useCashRegister } from "@/contexts/CashRegisterContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProfileSheet } from "./ProfileSheet";
import { CalculatorDialogLauncher } from "@/components/CalculatorDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useT } from "@/i18n";
import { useAuth } from "@/contexts/useAuth";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function Header() {
  const asset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, "")}`;
  // Estado de conexión
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const t = useT();
  const { user } = useAuth();
  const displayName = user?.name ?? user?.username ?? user?.email ?? "";
  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const isMobile = useIsMobile();
  const { cart } = useCart();
  const { exchangeRate } = useCart();
  const { toggleSidebar, state } = useSidebar();
  // Count distinct line items in the cart (each product counts as 1 regardless of quantity)
  const cartItemCount = cart.reduce((total, item) => total + (item.inventoryCount > 0 ? 1 : 0), 0);
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const { toast } = useToast();
  const { cajaAbierta, currentSession } = useCashRegister();
  const { data: userCtx } = useUserContext();
  const { hasRole } = useUserPermissions();

  const isSeller = (() => {
    const roles = (userCtx?.roles ?? []).map((r) => String(r ?? "").trim().toLowerCase());
    if (roles.includes("vendedor") || roles.includes("seller")) return true;
    return hasRole(["vendedor", "seller"]);
  })();

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Factura generada",
      message: "La venta FACT-000123 se imprimió correctamente.",
      time: "Hace 2 min",
      read: false,
    },
    {
      id: "2",
      title: "Stock bajo",
      message: "El producto Pasta Larga tiene menos de 5 unidades.",
      time: "Hoy • 9:15 am",
      read: false,
    },
    {
      id: "3",
      title: "Actualización disponible",
      message: "Hay una nueva versión de Venta Simplyfy lista para instalar.",
      time: "Ayer",
      read: true,
    },
    {
      id: "4",
      title: "Cliente nuevo registrado",
      message: "Se creó el cliente Juan Pérez en el sistema.",
      time: "Hoy • 8:40 am",
      read: false,
    },
    {
      id: "5",
      title: "Devolución procesada",
      message: "La devolución DEV-000045 fue aplicada correctamente.",
      time: "Hoy • 8:10 am",
      read: true,
    },
    {
      id: "6",
      title: "Cierre de caja pendiente",
      message: "Recuerda cerrar la caja del turno de ayer.",
      time: "Ayer • 7:55 pm",
      read: false,
    },
    {
      id: "7",
      title: "Tipo de cambio actualizado",
      message: "El tipo de cambio Bs/USD fue actualizado automáticamente.",
      time: "Ayer • 5:20 pm",
      read: true,
    },
    {
      id: "8",
      title: "Producto sin stock",
      message: "No quedan unidades de Azúcar Refinada en inventario.",
      time: "Ayer • 3:05 pm",
      read: false,
    },
    {
      id: "9",
      title: "Backup completado",
      message: "La copia de seguridad diaria se realizó con éxito.",
      time: "Esta semana",
      read: true,
    },
    {
      id: "10",
      title: "Recordatorio de mantenimiento",
      message:
        "Programa el mantenimiento mensual de tus equipos POS para evitar fallas inesperadas, pérdidas de información y tiempos muertos durante la atención a tus clientes en horas pico.",
      time: "Esta semana",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState<Record<string, boolean>>({});

  const { language, setLanguage } = useLanguage();
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  const visibleNotifications = showAllNotifications
    ? notifications
    : notifications.slice(0, 5);

  const hasMoreNotifications = notifications.length > visibleNotifications.length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const isPosView = location.pathname === "/" || location.pathname === "/pos" || location.pathname.startsWith("/pos/");
  const hasUserContext = !!userCtx;
  const showDashboardLink = hasUserContext && isPosView && !isSeller;
  const showPosLink = hasUserContext && !isPosView && userCtx?.scope === "tenant" && !isSeller;

  // Timer for open cash register (caja) when in POS view
  const [elapsedLabel, setElapsedLabel] = useState<string>("");

  useEffect(() => {
    if (!isPosView) {
      setElapsedLabel("");
      return;
    }

    let startTime: Date | null = null;

    // 1) Prefer currentSession.startTime from context
    if (currentSession?.startTime) {
      startTime = new Date(currentSession.startTime);
    } else if (cajaAbierta?.abierto_at) {
      // 2) Fallback to cajaAbierta.abierto_at from backend
      startTime = new Date(cajaAbierta.abierto_at);
    } else {
      // 3) Last resort: read from localStorage
      try {
        const rawArqueo = localStorage.getItem('caja_arqueo');
        if (rawArqueo) {
          const parsed = JSON.parse(rawArqueo);
          if (parsed?.abierto_at) {
            startTime = new Date(parsed.abierto_at);
          }
        }

        // If still no startTime but caja_status indicates open, start from now
        if (!startTime) {
          const rawStatus = localStorage.getItem('caja_status');
          if (rawStatus) {
            const parsedStatus = JSON.parse(rawStatus);
            if (parsedStatus) {
              startTime = new Date();
            }
          }
        }
      } catch {
        // ignore storage errors
      }
    }

    if (!startTime) {
      setElapsedLabel("");
      return;
    }

    const formatElapsed = () => {
      const now = new Date();
      const diffMs = now.getTime() - startTime.getTime();
      if (diffMs < 0) {
        setElapsedLabel("00:00:00");
        return;
      }
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
      const seconds = String(totalSeconds % 60).padStart(2, "0");
      setElapsedLabel(`${hours}:${minutes}:${seconds}`);
    };

    formatElapsed();
    const id = setInterval(formatElapsed, 1000);
    return () => clearInterval(id);
  }, [isPosView, cajaAbierta, currentSession]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      }
    }
  };

  const openCart = () => {
    if (cartItemCount <= 0) {
      toast({ title: t("layout.header.cartEmptyTitle"), description: t("layout.header.cartEmptyDescription"), variant: 'warning' });
      return;
    }
    setCartOpen(true);
  };

  useEffect(() => {
  if (location.pathname === '/pos/cart') setCartOpen(true);
  else setCartOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = () => setCartOpen(true);
    window.addEventListener('pos:openCartSheet', handler);
    return () => window.removeEventListener('pos:openCartSheet', handler);
  }, []);

  // Listen for a close event so other parts of the app can programmatically close the cart sheet
  useEffect(() => {
    const closeHandler = () => setCartOpen(false);
    window.addEventListener('pos:closeCartSheet', closeHandler);
    return () => window.removeEventListener('pos:closeCartSheet', closeHandler);
  }, []);

  return (
    <header
      className={[
        "fixed top-0 right-0 z-50 flex items-center px-3 sm:px-4 md:px-6",
        isMobile
          ? "bg-white text-foreground border-b-0"
          : "bg-white text-foreground border-b border-border",
        isMobile ? "h-24" : "h-16 sm:h-16"
      ].join(" ")}
      style={{
        left: isPosView ? 0 : (isMobile ? 0 : state === "expanded" ? "var(--sidebar-width)" : "var(--sidebar-width-icon)"),
        ...(isMobile ? {} : {}),
      }}
    >
      <div className="relative flex w-full items-center justify-between">
        <div className={isMobile ? "flex items-center w-24 h-12 gap-2" : "flex items-center gap-3"}>
          {/* POS logo on far left (desktop only) */}
          {!isMobile && isPosView && (
            <Link to="/" className="inline-flex items-center gap-2">
              <img
                src={asset('img/ms-icon-310x310.png')}
                alt="Logo Venta Simplyfy"
                className="h-7 w-7 rounded-md"
              />
            </Link>
          )}

          {/* POS caja timer badge (desktop only, POS view only) */}
          {!isMobile && isPosView && elapsedLabel && (
            <div className="btn-primary-new btn-primary-new-hover inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                <Clock3 className="h-3 w-3" />
              </span>
              <span>{elapsedLabel}</span>
            </div>
          )}

          {/* Toggle button: hamburger on mobile, double-chevron round on desktop */}
          {isMobile ? (
            <button
              type="button"
              aria-label={t("layout.header.openMenu")}
              onClick={toggleSidebar}
              className={[
                "inline-flex items-center justify-center",
                "h-10 w-10",
                "bg-transparent transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              ].join(" ")}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 text-brand-orange"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <line x1="5" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                <circle cx="16" cy="7" r="2" fill="currentColor" />
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                <circle cx="10" cy="12" r="2" fill="currentColor" />
                <line x1="5" y1="17" x2="19" y2="17" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                <circle cx="13" cy="17" r="2" fill="currentColor" />
              </svg>
            </button>
          ) : (
            !isPosView && (
              <button
                type="button"
                aria-label={state === "expanded" ? t("layout.header.collapseSidebar") : t("layout.header.expandSidebar")}
                onClick={toggleSidebar}
                className={[
                  "inline-flex items-center justify-center",
                  "h-6 w-6 rounded-full",
                  "bg-brand-orange text-white",
                  "hover:bg-brand-orange-2 transition",
                  "shadow-sm",
                  "-ml-9 z-20"
                ].join(" ")}
              >
                {state === "expanded" ? (
                  <ChevronsLeft className="h-4 w-4" />
                ) : (
                  <ChevronsRight className="h-4 w-4" />
                )}
              </button>
            )
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-3">
            {isMobile && (
              <span
                className={[
                  "font-bold leading-none tracking-tight text-[24px] text-foreground",
                ].join(" ")}
              >
                {t("common.appName")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2 w-12 sm:w-auto">
          {/* Desktop action bar */}
          {!isMobile && (
            <div className="hidden md:flex items-center gap-2 mr-2">
              {/* BCV rate badge with logo */}
              <div className="inline-flex items-center gap-2 px-3 h-9 rounded-lg border border-border bg-white">
                <img
                  src={asset('img/logo_bcv.png')}
                  alt="BCV"
                  className="h-5 w-5"
                />
                <span className="text-xs text-muted-foreground">BCV</span>
                <span className="font-semibold text-sm">Bs {(exchangeRate || 0).toFixed(8)}</span>
              </div>
              {/* Dashboard: sólo visible cuando estamos en la vista POS */}
              {showDashboardLink && (
                <Link
                  to="/dashboard"
                  className="btn-gradient-orange inline-flex items-center gap-2 px-4 h-9 rounded-lg text-xs hover:brightness-110"
                  onClick={() => {
                    // En desktop, si el sidebar está colapsado, expandirlo al ir al dashboard
                    if (!isMobile && state === "collapsed") {
                      toggleSidebar();
                    }
                  }}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>{t("common.dashboard")}</span>
                </Link>
              )}

              {/* POS: visible sólo en scope tenant */}
              {showPosLink && (
                <Link
                  to="/"
                  className="btn-primary-new btn-primary-new-hover inline-flex items-center gap-2 px-4 h-9 rounded-lg text-xs hover:brightness-110"
                  onClick={() => {
                    // En desktop, si el sidebar está expandido, colapsarlo al ir a POS
                    if (!isMobile && state === "expanded") {
                      toggleSidebar();
                    }
                  }}
                >
                  <Monitor className="h-4 w-4" />
                  <span>{t("common.pos")}</span>
                </Link>
              )}


              {/* Icon buttons row */}
              <div className="flex items-center gap-2">
                {/* Calculator: visible solo en la vista POS */}
                {isPosView && <CalculatorDialogLauncher />}

                {/* Language */}
                <DropdownMenu open={languageMenuOpen} onOpenChange={setLanguageMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center h-9 w-9 rounded-xl text-white shadow-sm border border-transparent bg-gradient-to-br from-amber-400 via-amber-300 to-orange-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
                      onClick={() => setLanguageMenuOpen((open) => !open)}
                    >
                      {language === "en" && (
                        <img
                          src={asset('img/flags/us.png')}
                          alt="English"
                          className="h-4 w-6 rounded-sm object-cover"
                        />
                      )}
                      {language === "pt" && (
                        <img
                          src={asset('img/flags/br.png')}
                          alt="Português"
                          className="h-4 w-6 rounded-sm object-cover"
                        />
                      )}
                      {language === "es" && (
                        <img
                          src={asset('img/flags/es.png')}
                          alt="Español"
                          className="h-4 w-6 rounded-sm object-cover"
                        />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-40 text-xs"
                  >
                    <DropdownMenuItem
                      onClick={() => setLanguage("es")}
                      className={[
                        "flex items-center justify-between gap-2 text-gray-700 data-[highlighted]:bg-[#FFE7D6] data-[highlighted]:text-amber-800",
                        language === "es" ? "font-semibold text-amber-700 bg-[#FFE7D6]" : "",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-2">
                        <img
                          src={asset('img/flags/es.png')}
                          alt="Español"
                          className="h-4 w-6 rounded-sm object-cover"
                        />
                        <span>{t("layout.header.language.es")}</span>
                      </span>
                      {language === "es" && (
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setLanguage("en")}
                      className={[
                        "flex items-center justify-between gap-2 text-gray-700 data-[highlighted]:bg-[#FFE7D6] data-[highlighted]:text-amber-800",
                        language === "en" ? "font-semibold text-amber-700 bg-[#FFE7D6]" : "",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-2">
                        <img
                          src={asset('img/flags/us.png')}
                          alt="English"
                          className="h-4 w-6 rounded-sm object-cover"
                        />
                        <span>{t("layout.header.language.en")}</span>
                      </span>
                      {language === "en" && (
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setLanguage("pt")}
                      className={[
                        "flex items-center justify-between gap-2 text-gray-700 data-[highlighted]:bg-[#FFE7D6] data-[highlighted]:text-amber-800",
                        language === "pt" ? "font-semibold text-amber-700 bg-[#FFE7D6]" : "",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-2">
                        <img
                          src={asset('img/flags/br.png')}
                          alt="Português"
                          className="h-4 w-6 rounded-sm object-cover"
                        />
                        <span>{t("layout.header.language.pt")}</span>
                      </span>
                      {language === "pt" && (
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Fullscreen */}
                <button
                  type="button"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50"
                  onClick={toggleFullscreen}
                >
                  <Maximize2 className="h-4 w-4" />
                </button>

                {/* Notifications inbox (mail-style) */}
                <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                  </PopoverContent>
                </Popover>

                {/* Notifications */}
                {/* <button
                  type="button"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50"
                >
                  <Bell className="h-4 w-4" />
                </button> */}

                {/* Settings */}
                {/* <button
                  type="button"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4" />
                </button> */}
              </div>
            </div>
          )}

          {/* Mobile cart button */}
          {isMobile && (
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <Button
                variant="ghost"
                size="icon"
                onClick={openCart}
                aria-label={t("layout.header.openCart")}
                className={[
                  "relative",
                  "overflow-visible",
                  "text-brand-orange",
                  "hover:bg-transparent",
                  "hover:text-brand-orange",
                  "focus-visible:text-brand-orange",
                  "h-11 w-11"
                ].join(" ")}
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="pointer-events-none z-10 absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center text-xs shadow ring-1 ring-white/80 bg-red-500 text-white border-transparent hover:bg-red-500"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>

              <SheetContent
                side="right"
                className="w-full p-0 sm:max-w-lg flex flex-col overflow-hidden ease-out data-[state=open]:duration-700 data-[state=closed]:duration-400 will-change-transform"
              >
                <CartSheet />
              </SheetContent>
            </Sheet>
          )}

          {/* Perfil conectado con anillo degradado y estado */}
          {/* Profile sheet trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Perfil"
                className="hidden sm:inline-flex items-center justify-center p-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="relative">
                  <div className="rounded-full p-[3px] bg-gradient-to-b from-amber-200 to-amber-300 shadow-sm">
                    <div className="rounded-full p-[2px] bg-white shadow-inner">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-[10px] font-semibold text-neutral-600">{initials || "U"}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}
                  />
                </div>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-xs p-0 overflow-hidden">
              <ProfileSheet />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile footer harmony: remove gradient cap */}
    </header>
  );
}
