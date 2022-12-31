const { AuthorizationCode } = require("simple-oauth2");

const ynabAPI = "https://app.youneedabudget.com";

function createAuthClient(credentials) {
  if (!credentials.client.id) {
    throw new Error("MISSING REQUIRED ENV VARS. Please set YNAB_CLIENT_ID");
  }

  if (!credentials.client.secret) {
    throw new Error("MISSING REQUIRED ENV VARS. Please set YNAB_CLIENT_SECRET");
  }

  // return simple-oauth2 instance
  return new AuthorizationCode(credentials);
}

/* Create oauth2 instance to use in our two functions */
module.exports = createAuthClient({
  client: {
    id: process.env.YNAB_CLIENT_ID,
    secret: process.env.YNAB_CLIENT_SECRET,
  },
  auth: {
    tokenHost: ynabAPI,
    tokenPath: `${ynabAPI}/oauth/token`,
    authorizePath: `${ynabAPI}/oauth/authorize`,
  },
});
