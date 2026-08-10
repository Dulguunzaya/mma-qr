import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";

const httpLink = new HttpLink({
  uri: "/api/graphql",
  credentials: "include",
});

const authLink = new SetContextLink(({ headers }) => {
  let token: string | null = null;

  try {
    token = typeof window === "undefined" ? null : localStorage.getItem("token");
  } catch {
    // The same-origin proxy can authenticate with the HttpOnly cookie.
  }

  return {
    headers: {
      ...headers,
      "x-app-token": process.env.NEXT_PUBLIC_ERXES_APP_TOKEN ?? "",
      ...(token ? { "client-auth-token": token } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
