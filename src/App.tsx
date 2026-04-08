import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UIProvider } from '@/contexts/UIContext';
import { DemoAuthProvider } from '@/features/auth/DemoAuthContext';
import { NavigationConfigProvider } from '@/contexts/NavigationConfigContext';
import { AppRoutes } from '@/routes/AppRoutes';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <UIProvider>
            <NavigationConfigProvider>
              <DemoAuthProvider>
                <AppRoutes />
                <Toaster />
                <Sonner />
              </DemoAuthProvider>
            </NavigationConfigProvider>
          </UIProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
