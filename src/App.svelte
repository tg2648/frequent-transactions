<script>
  import { onMount } from "svelte";
  import * as ynab from "ynab";
  import Footer from "./lib/Footer.svelte";

  // Import our config for YNAB
  import { config } from "./ynab_config";

  let token;
  let api = new ynab.api("temp");
  let budgets = [];
  let loading;

  onMount(() => {
    token = findYNABToken();
    if (token) {
      api = new ynab.api(token);
      getBudgets();
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

  function getBudgets() {
    loading = true;
    api.budgets
      .getBudgets()
      .then((res) => {
        budgets = res.data.budgets;
      })
      .catch((err) => {
        console.error(err.error.detail);
      })
      .finally(() => {
        loading = false;
      });
  }
</script>

<main>
  <h1>Frequent Transactions for YNAB</h1>

  {#if loading}
    <p>Loading...</p>
  {:else if token}
    {#each budgets as budget (budget.id)}
      <p>{budget.name}</p>
    {/each}
    <p>
      <button on:click|preventDefault={logout}> Logout </button>
    </p>
  {:else}
    <button on:click|preventDefault={authorizeWithYNAB}>
      Authorize with YNAB
    </button>
  {/if}

  {#if !token}
    <Footer/>
  {/if}
</main>
