"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  // Create QueryClient inside component to avoid shared state across requests (SSR-safe)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
        {children}
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}
