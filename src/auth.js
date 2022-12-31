export function redirectToOAuth() {
  // tell the auth flow where to go once you have a token
  const successURL = `${location.origin}${location.pathname}`;

  // redirect to start the OAuth flow
  location.replace(`/.netlify/functions/auth?url=${successURL}`);
}

export function findTokens() {
  let tokens = {};
  const search = window.location.hash
    .substring(1)
    .replace(/&/g, '","')
    .replace(/=/g, '":"');

  if (search && search !== "") {
    // Try to get access_token from the hash returned by OAuth
    const params = JSON.parse('{"' + search + '"}', function (key, value) {
      return key === "" ? value : decodeURIComponent(value);
    });

    tokens.access_token = params.access_token;
    tokens.refresh_token = params.refresh_token;

    sessionStorage.setItem("ftfy-session", JSON.stringify(tokens));
    window.location.hash = "";
    window.location.search = ""; // Netlify forwards all search parameters during redirect
  } else {
    // Otherwise try sessionStorage
    tokens = JSON.parse(sessionStorage.getItem("ftfy-session"));
  }

  return tokens;
}
