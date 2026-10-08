const oauth = require("./utils/oauth");
const {
  redirectUri,
  clearStateCookie,
  verifyState,
  redirectToApp,
} = require("./utils/session");

exports.handler = async (event, context) => {
  const { code, state, error } = event.queryStringParameters ?? {};
  const clearCookie = { "Set-Cookie": clearStateCookie() };

  // e.g. the user denied access on the YNAB authorization page
  if (error) {
    return redirectToApp({ error: String(error).slice(0, 64) }, clearCookie);
  }

  const nonce = verifyState(event, state);
  if (!nonce) {
    return redirectToApp({ error: "invalid_state" }, clearCookie);
  }

  if (!code) {
    return redirectToApp({ error: "missing_code" }, clearCookie);
  }

  try {
    // if the user accepts, we get an authorization token, which we need to
    // exchange for an access token
    const { token } = await oauth.getToken({
      code,
      redirect_uri: redirectUri,
    });

    return redirectToApp(
      {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expires_at: token.expires_at.toISOString(),
        nonce,
      },
      clearCookie
    );
  } catch (err) {
    console.error("Access token error", err.output?.statusCode ?? err.name);

    return redirectToApp({ error: "token_exchange_failed" }, clearCookie);
  }
};
