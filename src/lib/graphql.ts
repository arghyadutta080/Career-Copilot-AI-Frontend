import { GraphQLClient } from "graphql-request";
import { useAuthStore } from "@/stores/authStore";

const GRAPHQL_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/graphql`;

/**
 * Creates a GraphQL client with dynamic auth header injection.
 * Reads the token from Zustand store at request time, ensuring
 * the latest token is always sent.
 */
export function getGraphQLClient(): GraphQLClient {
  const token = useAuthStore.getState().token;

  return new GraphQLClient(GRAPHQL_URL, {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  });
}
