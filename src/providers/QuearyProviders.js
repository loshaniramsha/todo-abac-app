"use client";

import { QueryClient, QueryClientProvider as ReactQueryProvider } from "@tanstack/react-query"
const queryClient =new QueryClient();

export default function QueryClientProvider({children}) {
    return(
        <ReactQueryProvider client={queryClient}>
            {children}
        </ReactQueryProvider>
    );
}