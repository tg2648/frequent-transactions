import oauth, { config } from "./utils/oauth";

exports.handler = async (event) => {
  if (
    !event.queryStringParameters ||
    Object.keys(event.queryStringParameters).length === 0
  ) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: "Missing required parameters `url`",
      }),
    };
  }

  const { url } = event.queryStringParameters;

  const authorizationURI = oauth.authorizeURL({
    redirect_uri: config.redirectUri,
    state: `url=${url}`,
  });

  return {
    statusCode: 302,
    headers: {
      Location: authorizationURI,
      "Cache-Control": "no-cache",
    },
    body: "redirecting to authorization...",
  };
};
