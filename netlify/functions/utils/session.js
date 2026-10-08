const crypto = require("crypto");

const siteUrl = process.env.URL || "http://localhost:8888";

// The only place the OAuth flow is allowed to send the browser (and tokens) back to
const appUrl = `${siteUrl}/`;
const redirectUri = `${siteUrl}/.netlify/functions/auth-callback`;

const STATE_COOKIE = "ftfy_oauth_state";
const STATE_MAX_AGE_SECS = 600;
const NONCE_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

function stateCookie(value, maxAge) {
  const secure = siteUrl.startsWith("https://") ? "; Secure" : "";
  return (
    `${STATE_COOKIE}=${value}; Path=/.netlify/functions/auth-callback; ` +
    `Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`
  );
}

/**
 * Creates a random OAuth `state` and the cookie that binds it, together with
 * the client's nonce, to this browser.
 */
function createState(nonce) {
  const state = crypto.randomBytes(32).toString("base64url");
  return {
    state,
    cookie: stateCookie(`${state}.${nonce}`, STATE_MAX_AGE_SECS),
  };
}

const clearStateCookie = () => stateCookie("", 0);

/**
 * Checks the `state` returned by YNAB against the cookie set by the auth function.
 * Returns the client's nonce if they match, otherwise null.
 */
function verifyState(event, state) {
  const cookieHeader = event.headers?.cookie ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${STATE_COOKIE}=`));

  if (!cookie || typeof state !== "string") {
    return null;
  }

  const [expectedState, nonce] = cookie
    .substring(STATE_COOKIE.length + 1)
    .split(".");

  if (!expectedState || !nonce || !NONCE_PATTERN.test(nonce)) {
    return null;
  }

  const a = Buffer.from(state);
  const b = Buffer.from(expectedState);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  return nonce;
}

/**
 * Redirect back to the app, passing `params` in the URL hash.
 */
function redirectToApp(params, extraHeaders = {}) {
  const hash = new URLSearchParams(params).toString();
  return {
    statusCode: 302,
    headers: {
      Location: `${appUrl}#${hash}`,
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
    body: "redirecting to application...",
  };
}

module.exports = {
  NONCE_PATTERN,
  redirectUri,
  createState,
  clearStateCookie,
  verifyState,
  redirectToApp,
};
