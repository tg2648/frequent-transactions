const oauth = require("./utils/oauth");
const { NONCE_PATTERN, redirectUri, createState } = require("./utils/session");

exports.handler = async (event, context) => {
  const nonce = event.queryStringParameters?.nonce;

  if (!nonce || !NONCE_PATTERN.test(nonce)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing or invalid parameter `nonce`" }),
    };
  }

  const { state, cookie } = createState(nonce);

  const authorizationURI = oauth.authorizeURL({
    redirect_uri: redirectUri,
    state,
  });

  return {
    statusCode: 302,
    headers: {
      Location: authorizationURI,
      "Set-Cookie": cookie,
      "Cache-Control": "no-store",
    },
    body: "redirecting to authorization...",
  };
};
