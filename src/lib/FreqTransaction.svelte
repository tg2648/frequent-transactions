<script>
  import { getContext, onMount } from "svelte";
  // @ts-ignore
  import * as ynab from "ynab";

  // Local imports
  import { config } from "../ynabConfig";

  // Props
  export let transaction, removeTransaction;

  const { getApi } = getContext(config.context_key);
  /** @type { ynab.api } */
  const ynabApi = getApi();

  const budgetId = getContext("budgetId");

  function logTransaction() {
    alert("Logging to: " + budgetId);
    // ynabApi.transactions.createTransaction(budgetId, {});
  }
</script>

<div class="card">
  <span>
    {transaction.account}
  </span>
  <span>
    {transaction.payee}
  </span>
  <span class={transaction.amount < 0 ? "negative" : "positive"}>
    {transaction.displayAmount}
  </span>

  <button on:click={logTransaction}>Log</button>
  <button on:click={removeTransaction}>X</button>
</div>

<style>
  .card {
    border: 1px solid #aaa;
    border-radius: 2px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1em;
  }

  .positive {
    color: #6d9f38;
  }

  .negative {
    color: #e26136;
  }
</style>
