<script>
  import { getContext, onMount, setContext } from "svelte";
  // @ts-ignore
  import * as ynab from "ynab";

  // Local imports
  import { config } from "../ynabConfig";
  import { apiError } from "../stores";
  import FreqTransactions from "./FreqTransactions.svelte";
  import {
    ACCOUNTS_STORAGE_KEY,
    addToLocalStorage,
    CATEGORIES_STORAGE_KEY,
    DATA_VERSION,
    getFromLocalStorage,
  } from "../utils";

  // Props
  export let budget;

  let budgetId = budget.id;
  let currencySettings = budget.currency_format;
  let accounts = [];
  let categories = [];
  let loading = false;
  let storageTimestamp;

  // Make budget ID available to child components
  setContext("budgetId", budgetId);

  const { getApi } = getContext(config.context_key);
  /** @type { ynab.api } */
  const ynabApi = getApi();

  onMount(() => {
    getAccounts();
    getCategories();
  });

  function getAccounts() {
    let cachedData = getFromLocalStorage(ACCOUNTS_STORAGE_KEY, DATA_VERSION);
    if (cachedData) {
      console.log("Accounts cached");
      accounts = cachedData.data;
      storageTimestamp = cachedData.timestamp;
    } else {
      console.log("Calling accounts endpoint");
      loading = true;
      ynabApi.accounts
        .getAccounts(budgetId)
        .then((res) => {
          accounts = res.data.accounts;
          accounts.sort((a, b) => a.name.localeCompare(b.name));
          addToLocalStorage(ACCOUNTS_STORAGE_KEY, accounts, DATA_VERSION);
        })
        .catch((err) => {
          apiError.set(err.error.detail);
        })
        .finally(() => {
          loading = false;
        });
    }
  }

  function getCategories() {
    let cachedData = getFromLocalStorage(CATEGORIES_STORAGE_KEY, DATA_VERSION);
    if (cachedData) {
      console.log("Categories cached");
      categories = cachedData.data;
    } else {
      console.log("Calling categories endpoint");
      loading = true;
      ynabApi.categories
        .getCategories(budgetId)
        .then((res) => {
          /**
           * Clean up categories:
           * 1. Exclude deleted or hidden
           * 2. Flatten category groups
           * 3. Keep only id and name in the format "categoryGroupName: categoryName"
           */
          categories = res.data.category_groups
            .filter((category) => !category.deleted && !category.hidden)
            .flatMap((categoryGroup) =>
              categoryGroup.categories
                .filter((category) => !category.deleted && !category.hidden)
                .map((category) => ({
                  id: category.id,
                  name: categoryGroup.name.startsWith("Internal")
                    ? category.name
                    : `${categoryGroup.name}: ${category.name}`,
                }))
            );
          addToLocalStorage(CATEGORIES_STORAGE_KEY, categories, DATA_VERSION);
        })
        .catch((err) => {
          apiError.set(err.error.detail);
        })
        .finally(() => {
          loading = false;
        });
    }
  }

  // TODO: refactor
  function invalidateCache() {
    localStorage.clear();
    getAccounts();
    getCategories();
    storageTimestamp = null;
  }
</script>

<FreqTransactions {accounts} {categories} {currencySettings} />

<p>
  <i>
    Using budget: {budget.name}
    (last updated on {storageTimestamp ?? new Date().toISOString()})
  </i>
  <button on:click={invalidateCache}>Refresh</button>
</p>
