const qs = require("querystring");
const oauth = require("./utils/oauth");

exports.handler = async (event, context) => {
  const siteUrl = process.env.URL || "http://localhost:8888";

  if (!event.queryStringParameters) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Not authorized" }),
    };
  }

  const { code, state } = event.queryStringParameters;
  const { url } = qs.parse(state);

  try {
    // if the user accepts, we get an authorization token, which we need to
    // exchange for an access token
    const { token } = await oauth.getToken({
      code,
      redirect_uri: `${siteUrl}/.netlify/functions/auth-callback`,
    });

    return {
      statusCode: 302,
      headers: {
        Location:
          `${url}#access_token=${token.access_token}` +
          `&refresh_token=${token.refresh_token}` +
          `&expires_at=${token.expires_at.toISOString()}`,
        "Cache-Control": "no-cache",
      },
      body: "redirecting to application...",
    };
  } catch (err) {
    console.error("Access token error", err.message);
    console.error(err);

    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
