"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { BASE_PATH } from "@/utils/basePath";

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const authBasePath = `${BASE_PATH || ""}/api/auth`;
  return (
    <NextAuthSessionProvider basePath={authBasePath}>
      {children}
    </NextAuthSessionProvider>
  );
}
