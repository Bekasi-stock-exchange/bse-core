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
      try {
        // Attempt to refresh the token using native fetch to avoid interceptor loop
        const refreshResponse = await fetch(`${MS_USER_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: {
            "x-api-key": MS_USER_API_KEY,
            "Content-Type": "application/json",
          },
          // Ensure cookies are sent (important for refresh token)
          credentials: "include",
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData?.data?.accessToken) {
            const newAccessToken = refreshData.data.accessToken;
            // Update auth store
            useAuthStore.getState().setAccessToken(newAccessToken);

            // Retry original request with new token
            response = await fetch(resource, { ...init, headers: getHeaders(newAccessToken) });
          } else {
            useAuthStore.getState().logout();
          }
        } else {
          // Refresh failed (e.g. token expired/invalid)
          useAuthStore.getState().logout();
        }
      } catch {
        useAuthStore.getState().logout();
      }
    }

    return response;
  }) as typeof fetch,
});
