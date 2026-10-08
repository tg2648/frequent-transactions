import { ynabData } from "./stores";

const OAUTH_NONCE_KEY = "ftfy-oauth-nonce";

export function redirectToOAuth() {
  // The nonce must come back with the tokens, proving this tab started the login
  const nonce = crypto.randomUUID();
  sessionStorage.setItem(OAUTH_NONCE_KEY, nonce);

  // redirect to start the OAuth flow
  location.replace(
    `/.netlify/functions/auth?nonce=${encodeURIComponent(nonce)}`
  );
}

export async function findTokenData() {
  const hash = window.location.hash.substring(1);

  if (hash) {
    const params = new URLSearchParams(hash);
    const expectedNonce = sessionStorage.getItem(OAUTH_NONCE_KEY);
    sessionStorage.removeItem(OAUTH_NONCE_KEY);
    window.history.replaceState(null, "", window.location.pathname);

    if (params.has("error")) {
      console.warn("Authorization failed:", params.get("error"));
    } else if (
      params.get("access_token") &&
      expectedNonce &&
      params.get("nonce") === expectedNonce
    ) {
      // Accept tokens only from a login this tab started
      const tokenData = {
        access_token: params.get("access_token"),
        refresh_token: params.get("refresh_token"),
        expires_at: params.get("expires_at"),
      };

      ynabData.token.save(tokenData);
      return tokenData;
    } else if (params.has("access_token")) {
      console.warn("Ignoring token response not started by this tab");
    }
  }

  // Otherwise try storage
  return await ynabData.token.load();
}

/**
 * Returns new access and refresh tokens if the refresh is successful.
 * Returns null if token could not be refreshed.
 */
export async function refreshToken(tokenData) {
  console.log("Refreshing token");
  const newTokenData = await fetch("/.netlify/functions/auth-refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tokenData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not refresh token");
      }

      return response.json();
    })
    .then((data) => {
      return data.data;
    })
    .catch((error) => {
      console.error("Error:", error);
      return null;
    });

  return newTokenData;
}
