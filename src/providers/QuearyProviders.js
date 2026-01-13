"use client";

import { QueryClient, QueryClientProvider } from "react-query";
const QueryClient =new QueryClient();

export default function QueryClientProvider({children}) {
    return(
        <QueryClientProvider client={QueryClient}>
            {children}
        </QueryClientProvider>
    );
}