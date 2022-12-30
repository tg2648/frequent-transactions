import { AuthorizationCode } from "simple-oauth2";

const ynabAPI = "https://app.youneedabudget.com";
const siteUrl = process.env.URL || "http://localhost:8888";

export const config = {
  clientId: process.env.YNAB_CLIENT_ID,
  clientSecret: process.env.YNAB_CLIENT_SECRET,
  tokenHost: ynabAPI,
  authorizePath: `${ynabAPI}/oauth/authorize`,
  tokenPath: `${ynabAPI}/oauth/token`,
  redirectUri: `${siteUrl}/.netlify/functions/auth-callback`,
};

function authInstance(credentials) {
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
export default authInstance({
  client: {
    id: config.clientId,
    secret: config.clientSecret,
  },
  auth: {
    tokenHost: config.tokenHost,
    tokenPath: config.tokenPath,
    authorizePath: config.authorizePath,
  },
});
