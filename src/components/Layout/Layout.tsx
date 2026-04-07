import { AppSidebar } from "./Sidebar";
import { Header } from "./Header";
import { ThemeCustomizerFab } from "../ThemeCustomizerFab"; // restaurado
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { MobileFooter } from "./MobileFooter";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  const mainRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  const isPosView =
    location.pathname === "/" ||
    location.pathname === "/pos" ||
    location.pathname.startsWith("/pos/");

  // When switching back to desktop, force scroll to top so header is visible and mobile state doesn't linger
  useEffect(() => {
    if (!isMobile) {
      requestAnimationFrame(() => {
        if (mainRef.current) {
          try {
            mainRef.current.scrollTo({ top: 0, behavior: "auto" });
          } catch {
            // fallback
            (mainRef.current as HTMLDivElement).scrollTop = 0;
          }
        }
        // Also ensure window isn't scrolled if any external container was used
        window.scrollTo({ top: 0, behavior: "auto" });
      });
    }
  }, [isMobile]);
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full overflow-hidden bg-background transform-none">
        {/* Sidebar:
          - Desktop: oculto en vistas POS (para tener POS a pantalla completa)
          - Mobile: disponible incluso en POS (se abre como panel lateral)
        */}
        {(!isPosView || isMobile) && <AppSidebar />}
        <div className="flex-1 flex flex-col transform-none">
          <Header />
          <main
            ref={mainRef}
            className={[
              "flex-1 p-2 sm:p-3 md:p-4 pb-20 lg:pb-4 bg-white",
              isMobile ? "mt-24" : "mt-16"
            ].join(" ")}
          >
            {/* PWA install and notification controls */}
            {!isMobile && (
              <div className="flex justify-end space-x-2 mb-4">
                <InstallPrompt />
              </div>
            )}
            {children}
          </main>
          {/* Mobile action footer */}
          {isMobile && <MobileFooter />}
          {/* Floating theme customizer button */}
          <ThemeCustomizerFab />
        </div>
      </div>
    </SidebarProvider>
  );
}
