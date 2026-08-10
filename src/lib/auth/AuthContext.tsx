"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useApolloClient } from "@apollo/client/react";
import {
  CLIENT_PORTAL_CURRENT_USER,
  type ClientPortalCurrentUserData,
  type CPUser,
} from "@/graphql/auth/queries";
import {
  CLIENT_PORTAL_LOGOUT,
  type ClientPortalLogoutData,
} from "@/graphql/auth/mutations";

type AuthContextValue = {
  user: CPUser | null;
  loading: boolean;
  login: (tokens?: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<unknown>;
};

export type AuthTokens = {
  token: string;
  refreshToken?: string;
};

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

function clearStoredTokens() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Storage can be unavailable in private or restricted mobile browsers.
  }
}

function storeTokens(tokens: AuthTokens) {
  try {
    localStorage.setItem(TOKEN_KEY, tokens.token);

    if (tokens.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch {
    // The same-origin HttpOnly session below remains the source of truth.
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const { data, loading, refetch } = useQuery<ClientPortalCurrentUserData>(
    CLIENT_PORTAL_CURRENT_USER,
    {
      fetchPolicy: "network-only",
      errorPolicy: "ignore",
    },
  );
  const [logoutMutation] = useMutation<ClientPortalLogoutData>(
    CLIENT_PORTAL_LOGOUT,
  );

  const login = useCallback(
    async (tokens?: AuthTokens) => {
      if (tokens?.token) {
        storeTokens(tokens);

        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token: tokens.token }),
        });

        if (!response.ok) {
          throw new Error("Unable to persist the authentication session");
        }
      } else {
        // Cookie-delivery portals should not keep a stale header token.
        clearStoredTokens();
      }

      await client.resetStore();
    },
    [client],
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation();
    } finally {
      clearStoredTokens();
      await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
      await client.clearStore();
    }
  }, [client, logoutMutation]);

  return (
    <AuthContext.Provider
      value={{
        user: data?.clientPortalCurrentUser ?? null,
        loading,
        login,
        logout,
        refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
