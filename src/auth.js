import { ynabData } from "./stores";

export function redirectToOAuth() {
  // tell the auth flow where to go once you have a token
  const successURL = `${location.origin}${location.pathname}`;

  // redirect to start the OAuth flow
  location.replace(`/.netlify/functions/auth?url=${successURL}`);
}

export async function findTokenData() {
  let tokenData = {};
  const search = window.location.hash
    .substring(1)
    .replace(/&/g, '","')
    .replace(/=/g, '":"');

  if (search && search !== "") {
    // Try to get access_token from the hash returned by OAuth
    const params = JSON.parse('{"' + search + '"}', function (key, value) {
      return key === "" ? value : decodeURIComponent(value);
    });

    tokenData.access_token = params.access_token;
    tokenData.refresh_token = params.refresh_token;
    tokenData.expires_at = params.expires_at;

    ynabData.token.save(tokenData);
    window.history.replaceState("", "", window.location.pathname);
  } else {
    // Otherwise try storage
    tokenData = await ynabData.token.load();
  }

  return tokenData;
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
