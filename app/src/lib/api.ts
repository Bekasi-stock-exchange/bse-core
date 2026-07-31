import { edenTreaty } from "@elysiajs/eden";
import type { App as UserApp } from "@bse/ms-user/src/index";

// The API URL for the ms-bse-core-user service
// Using process.env instead of import.meta.env for Next.js
// Fallback is still localhost:3001
const MS_USER_URL =
  process.env.NEXT_PUBLIC_MS_USER_URL || "http://localhost:3001";

// The API key is defined in the backend and should be provided via environment variables.
const MS_USER_API_KEY =
  process.env.NEXT_PUBLIC_MS_USER_API_KEY || "my-secret-api-key";

import { useAuthStore } from "@store/useAuthStore";

// Single-flight refresh: concurrent 401s share one /auth/refresh call.
// Refresh tokens are single-use (server rotates them), so without a mutex,
// parallel retries would each fire a refresh and the later ones would hit the
// now-invalidated cookie and log the user out spuriously.
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshResponse = await fetch(`${MS_USER_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "x-api-key": MS_USER_API_KEY,
          "Content-Type": "application/json",
        },
        // Send the httpOnly refresh token cookie
        credentials: "include",
      });

      if (!refreshResponse.ok) {
        // Refresh rejected (token expired/invalid/reuse detected) or server error
        useAuthStore.getState().logout();
        return null;
      }

      const refreshData = await refreshResponse.json();
      const newAccessToken = refreshData?.data?.accessToken;
      if (!newAccessToken) {
        useAuthStore.getState().logout();
        return null;
      }
      useAuthStore.getState().setAccessToken(newAccessToken);
      return newAccessToken as string;
    } catch {
      // Network error / server down
      useAuthStore.getState().logout();
      return null;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

// Create the Eden Treaty client for the User service with type safety
export const userApi = edenTreaty<UserApp>(MS_USER_URL, {
  fetcher: (async (resource, init) => {
    // Determine path being requested to avoid infinite loops
    const urlString = typeof resource === "string" ? resource : resource.toString();
    const isRefreshRoute = urlString.includes("/auth/refresh");
    const isLoginRoute = urlString.includes("/auth/login");

    const getHeaders = (token?: string | null) => {
      const headers = new Headers(init?.headers);
      headers.set("x-api-key", MS_USER_API_KEY);

      const accessToken = token ?? useAuthStore.getState().accessToken;
      if (accessToken && !isRefreshRoute && !isLoginRoute) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    };

    // Make original request
    let response = await fetch(resource, { ...init, headers: getHeaders() });

    // Handle auto refresh on 401 Unauthorized
    if (response.status === 401 && !isRefreshRoute && !isLoginRoute) {
      const newToken = await doRefresh();
      if (newToken) {
        // Retry original request with the new access token
        response = await fetch(resource, { ...init, headers: getHeaders(newToken) });

        // Recheck: if the retry is STILL 401, the new token was rejected
        // (server restarted / token invalidated / misconfigured auth) — log out
        // rather than retrying in a loop.
        if (response.status === 401) {
          useAuthStore.getState().logout();
        }
      }
      // If newToken is null, doRefresh already logged the user out.
    }

    return response;
  }) as typeof fetch,
});
