const oauth = require("./utils/oauth");

exports.handler = async (event, context) => {
  let tokenData;

  try {
    tokenData = JSON.parse(event.body);
    console.log(tokenData);
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Parsing error" }),
    };
  }

  try {
    const newToken = await oauth.createToken(tokenData).refresh();
    const newTokenData = {
      access_token: newToken.token.access_token,
      refresh_token: newToken.token.refresh_token,
      expires_at: newToken.token.expires_at.toISOString(),
    };

    return {
      statusCode: 200,
      body: JSON.stringify({ data: newTokenData }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Refresh error" }),
    };
  }
};
