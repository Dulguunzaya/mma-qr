import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";

const httpLink = new HttpLink({
  uri:
    process.env.NEXT_PUBLIC_ERXES_ENDPOINT ??
    process.env.NEXT_PUBLIC_GRAPHQL_URL,
  credentials: "include",
  headers: {
    "x-app-token": process.env.NEXT_PUBLIC_ERXES_APP_TOKEN ?? "",
  },
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
