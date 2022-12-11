<script>
  // @ts-ignore
  import * as ynab from "ynab";
  import { getContext } from "svelte";

  // Local imports
  import { config } from "../config";
  import { apiError } from "../stores";

  // Props
  export let transactionDetails, removeTransaction;

  const { getApi } = getContext(config.context_key);
  /** @type { ynab.api } */
  const ynabApi = getApi();

  let loading;

  function logTransaction() {
    loading = true;

    ynabApi.transactions
      .createTransaction(transactionDetails.budget.id, {
        transaction: {
          account_id: transactionDetails.account.id,
          category_id: transactionDetails.category.id,
          payee_name: transactionDetails.payeeName,
          date: ynab.utils.getCurrentDateInISOFormat(),
          amount: transactionDetails.milliAmount,
          memo: transactionDetails.memo,
          flag_color: transactionDetails.flag,
          approved: transactionDetails.approved,
          cleared: transactionDetails.cleared
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
    {transactionDetails.budget.name}
  </span>
  <span>
    {transactionDetails.account.name}
  </span>
  <span>
    {transactionDetails.category.name}
  </span>
  <span>
    {transactionDetails.payeeName}
  </span>
  <span class={transactionDetails.milliAmount < 0 ? "negative" : "positive"}>
    {transactionDetails.displayAmount}
  </span>
  <span>
    {transactionDetails.memo}
  </span>
  <span>
    {transactionDetails.cleared}
  </span>
  <span>
    {transactionDetails.approved}
  </span>
  <span>
    {transactionDetails.flag}
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
