<script>
  import { onMount } from "svelte";
  import * as ynab from "ynab";

  // Import our config for YNAB
  import config from "./ynab_config.json";

  let token;
  let ynabApi;

  onMount(() => {
    token = findYNABToken();
    if (token) {
      ynabApi = new ynab.api(token);
    }
  });

  function authorizeWithYNAB() {
    const uri = `https://app.youneedabudget.com/oauth/authorize?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=token`;
    location.replace(uri);
  }

  function findYNABToken() {
    let token = null;
    const search = window.location.hash
      .substring(1)
      .replace(/&/g, '","')
      .replace(/=/g, '":"');

    if (search && search !== "") {
      // Try to get access_token from the hash returned by OAuth
      const params = JSON.parse('{"' + search + '"}', function (key, value) {
        return key === "" ? value : decodeURIComponent(value);
      });

      token = params.access_token;
      sessionStorage.setItem("ynab_access_token", token);
      window.location.hash = "";
    } else {
      // Otherwise try sessionStorage
      token = sessionStorage.getItem("ynab_access_token");
    }

    return token;
  }

  function logout() {
    token = null;
    sessionStorage.clear();
  }
</script>

<main>
  <h1>Frequent Transactions for YNAB</h1>

  {#if token}
    Logged in
    <button on:click|preventDefault={logout}>
      Logout
    </button>
  {:else}
    <button on:click|preventDefault={authorizeWithYNAB}>
      Authorize with YNAB
    </button>
  {/if}

  <h2 id="privacy">Privacy Policy</h2>
  <p>
    This website does not store any information from you or your YNAB account.
    All data retrieved from the YNAB API is stored only in your browser and is
    never transmitted to any other location or third-party.
  </p>
</main>
