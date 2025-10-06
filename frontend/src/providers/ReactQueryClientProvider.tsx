"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function ReactQueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
    // Evitamos recrear el cliente con cada render
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}