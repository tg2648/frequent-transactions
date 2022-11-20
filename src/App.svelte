<script>
  import { onMount, setContext } from "svelte";
  import * as ynab from "ynab";

  // Local imports
  import { config } from "./ynabConfig";
  import { apiError } from "./stores";
  import {
    addToLocalStorage,
    DATA_VERSION,
    getFromLocalStorage,
    SELECTED_BUDGET_STORAGE_KEY,
  } from "./utils";
  import Budget from "./lib/Budget.svelte";
  import Footer from "./lib/Footer.svelte";

  /** @type { ynab.api } */
  let ynabApi = null;
  let token = null;
  let selectedBudget = null;
  let loading = false;

  // Make YNAB api available to other components
  setContext(config.context_key, {
    getApi: () => ynabApi,
  });

  onMount(() => {
    token = findYNABToken();
    if (token) {
      ynabApi = new ynab.api(token);
      getDefaultBudget();
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
    apiError.set(null);
    sessionStorage.clear();
    localStorage.clear();
  }

  function getDefaultBudget() {
    let cachedData = getFromLocalStorage(
      SELECTED_BUDGET_STORAGE_KEY,
      DATA_VERSION
    );

    if (cachedData) {
      console.log("Budget cached");
      selectedBudget = cachedData.data;
    } else {
      console.log("Calling budget endpoint");
      loading = true;
      ynabApi.budgets
        .getBudgets()
        .then((res) => {
          selectedBudget = res.data.default_budget;
          addToLocalStorage(
            SELECTED_BUDGET_STORAGE_KEY,
            selectedBudget,
            DATA_VERSION
          );
        })
        .catch((err) => {
          apiError.set(err.error.detail);
        })
        .finally(() => {
          loading = false;
        });
    }
  }
</script>

<main>
  <h1>Frequent Transactions for YNAB</h1>

  {#if $apiError}
    <p style="color: red;">
      YNAB Error: {$apiError}
    </p>
  {/if}

  {#if loading}
    <p>Loading...</p>
  {:else if token}
    <Budget budget={selectedBudget} />
    <p>
      <button on:click|preventDefault={logout}> Logout </button>
    </p>
  {:else}
    <button on:click|preventDefault={authorizeWithYNAB}>
      Authorize with YNAB
    </button>
    <Footer />
  {/if}
</main>
