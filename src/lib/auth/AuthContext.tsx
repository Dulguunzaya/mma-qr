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
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<unknown>;
};

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
    async () => {
      localStorage.removeItem("token");
      await client.resetStore();
    },
    [client],
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation();
    } finally {
      localStorage.removeItem("token");
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
