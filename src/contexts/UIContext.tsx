import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  // Sidebar state
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  
  // Mobile drawer state
  isMobileDrawerOpen: boolean;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
  
  // Theme state (for future implementation)
  isDarkMode: boolean;
  toggleTheme: () => void;
  
  // Screen size detection
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

export function UIProvider({ children }: UIProviderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Screen size detection
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const isMobile = screenSize.width < 768;
  const isTablet = screenSize.width >= 768 && screenSize.width < 1024;
  const isDesktop = screenSize.width >= 1024;

  // Update screen size on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-collapse sidebar on mobile
  React.useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    } else if (!isMobile && !isSidebarOpen) {
      setIsSidebarOpen(true);
    }
  }, [isMobile, isSidebarOpen]);

  // Close mobile drawer when switching to desktop
  React.useEffect(() => {
    if (!isMobile && isMobileDrawerOpen) {
      setIsMobileDrawerOpen(false);
    }
  }, [isMobile, isMobileDrawerOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileDrawerOpen(!isMobileDrawerOpen);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const collapseSidebar = () => {
    setIsSidebarCollapsed(true);
  };

  const expandSidebar = () => {
    setIsSidebarCollapsed(false);
  };

  const openMobileDrawer = () => {
    setIsMobileDrawerOpen(true);
  };

  const closeMobileDrawer = () => {
    setIsMobileDrawerOpen(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const value: UIContextType = {
    isSidebarOpen,
    isSidebarCollapsed,
    toggleSidebar,
    collapseSidebar,
    expandSidebar,
    isMobileDrawerOpen,
    openMobileDrawer,
    closeMobileDrawer,
    isDarkMode,
    toggleTheme,
    isMobile,
    isTablet,
    isDesktop,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextType {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
