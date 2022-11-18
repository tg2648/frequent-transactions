<script>
  import { getContext, onMount } from "svelte";
  // @ts-ignore
  import * as ynab from "ynab";

  // Local imports
  import { config } from "../ynabConfig";
  import { apiError } from "../stores";

  export let budget;

  let budgetId = budget.id;
  let accounts = []
  let selectedAccountId = null;
  let loading = false;

  const { getApi } = getContext(config.context_key);
  /** @type { ynab.api } */
  const ynabApi = getApi();

  onMount(() => {
    getAccounts()
  })

  function getAccounts() {
    loading = true;
    ynabApi.accounts.getAccounts(budgetId)
      .then((res) => {
        accounts = res.data.accounts;
        console.log(accounts);
      })
      .catch((err) => {
        apiError.set(err.error.detail);
      })
      .finally(() => {
        loading = false;
      });
  }
</script>

<p>
  Using: {budget.name}
</p>

<form>
  <select bind:value={selectedAccountId}>
    {#each accounts as account}
      <option value={account.id}>
        {account.name}
      </option>
    {:else}
      <option></option>
    {/each}
  </select>
</form>

<p>
  Selected account: {selectedAccountId}
</p>
