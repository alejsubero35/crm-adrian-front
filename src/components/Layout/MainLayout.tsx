import React from 'react';
import { useUI } from '@/contexts/UIContext';
import { MasterHeader } from '../layout/MasterHeader';
import { MasterSidebar } from '../layout/MasterSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className = '' }: MainLayoutProps) {
  const { isMobile, isMobileDrawerOpen, isSidebarOpen, isSidebarCollapsed } = useUI();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <MasterSidebar />

      {/* Mobile Overlay */}
      {isMobile && isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => {
            // Close mobile drawer when clicking overlay
            const drawer = document.querySelector('[data-mobile-drawer]') as HTMLElement;
            drawer?.click();
          }}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <MasterHeader />

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 overflow-y-auto bg-background",
            "transition-all duration-300 ease-in-out",
            isMobile ? "ml-0 pb-20" : isSidebarCollapsed ? "ml-16" : "ml-64",
            className
          )}
        >
          <div className="container mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

// Mobile drawer trigger helper
export function MobileDrawerToggle() {
  const { openMobileDrawer } = useUI();
  
  return (
    <button
      data-mobile-drawer
      onClick={openMobileDrawer}
      className="hidden"
      aria-hidden="true"
    />
  );
}
