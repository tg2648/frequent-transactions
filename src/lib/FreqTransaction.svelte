<script>
  import { getContext } from "svelte";
  // @ts-ignore
  import * as ynab from "ynab";

  // Local imports
  import { config } from "../config";
  import { apiError } from "../stores";

  // Props
  export let transaction, removeTransaction;

  const budgetId = getContext("budgetId");
  const { getApi } = getContext(config.context_key);
  /** @type { ynab.api } */
  const ynabApi = getApi();

  let loading;

  function logTransaction() {
    loading = true;

    ynabApi.transactions
      .createTransaction(budgetId, {
        transaction: {
          account_id: transaction.account.id,
          category_id: transaction.category.id,
          payee_name: transaction.payeeName,
          date: ynab.utils.getCurrentDateInISOFormat(),
          amount: transaction.milliAmount,
          memo: transaction.memo,
          flag_color: transaction.flag,
          approved: transaction.approved,
          cleared: transaction.cleared
            ? ynab.SaveTransaction.ClearedEnum.Cleared
            : ynab.SaveTransaction.ClearedEnum.Uncleared,
        },
      })
      .then((res) => {
        console.log("Transaction logged!");
      })
      .catch((err) => {
        apiError.set(err.error.detail);
      })
      .finally(() => {
        loading = false;
      });
  }
</script>

<div class="card">
  <span>
    {transaction.account.name}
  </span>
  <span>
    {transaction.category.name}
  </span>
  <span>
    {transaction.payeeName}
  </span>
  <span class={transaction.milliAmount < 0 ? "negative" : "positive"}>
    {transaction.displayAmount}
  </span>
  <span>
    {transaction.memo}
  </span>
  <span>
    {transaction.cleared}
  </span>
  <span>
    {transaction.approved}
  </span>
  <span>
    {transaction.flag}
  </span>

  <button on:click={logTransaction}>{loading ? "..." : "Log"}</button>
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
