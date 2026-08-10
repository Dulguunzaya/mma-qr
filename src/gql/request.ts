type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type GraphQLRequest<TVariables> = {
  endpoint: string;
  query: string;
  variables: TVariables;
  appToken?: string;
  cache?: RequestCache;
};

export async function requestGraphQL<
  TData,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>({
  endpoint,
  query,
  variables,
  appToken,
  cache = "no-store",
}: GraphQLRequest<TVariables>): Promise<TData> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(appToken ? { "x-app-token": appToken } : {}),
    },
    body: JSON.stringify({ query, variables }),
    cache,
  });

  let result: GraphQLResponse<TData>;
  try {
    result = (await response.json()) as GraphQLResponse<TData>;
  } catch {
    throw new Error(`GraphQL returned invalid JSON (${response.status})`);
  }

  if (!response.ok || result.errors?.length) {
    const message =
      result.errors?.map((error) => error.message).filter(Boolean).join("; ") ||
      `GraphQL request failed (${response.status})`;
    throw new Error(message);
  }

  if (!result.data) {
    throw new Error("GraphQL returned no data");
  }

  return result.data;
}
