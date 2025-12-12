import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 Minutes
            gcTime: 1000 * 60 * 30, // 30 Minutes
            refetchOnWindowFocus: false,
            retry: 1,
        },
        mutations: {
            retry: 0
        }
    }
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
