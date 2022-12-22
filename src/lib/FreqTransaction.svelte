<script>
  // @ts-ignore
  import * as ynab from "ynab";
  import { getContext } from "svelte";
  import { Button, Icon, Collapse } from "sveltestrap";

  // Local imports
  import { config } from "../config";
  import { apiError, apiErrorType } from "../stores";
  import { ynabFlagColors } from "../utils";

  // Props
  export let transactionDetails, removeTransaction;

  const { getApi } = getContext(config.context_key);
  /** @type { ynab.api } */
  const ynabApi = getApi();

  let loading;
  let isOpen = false;
  let amountClass =
    transactionDetails.milliAmount < 0 ? "amount-negative" : "amount-positive";
  let approvedText = transactionDetails.approved ? "Approved" : "Not approved";
  let clearedText = transactionDetails.cleared ? "Cleared" : "Not cleared";

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
        if (err.error.name === "unauthorized") {
          apiError.set("Login expired. Please log out and log back in again.");
          apiErrorType.set("unauthorized");
        } else {
          apiError.set(err.error.detail);
        }
      })
      .finally(() => {
        loading = false;
      });
  }
</script>

<div class="row">
  <div class="col-lg-7">
    <div
      style:--flag-color={ynabFlagColors[transactionDetails.flag]}
      class:flag-border={transactionDetails.flag}
      class="card text-bg-light mb-3"
    >
      <div class="card-body">
        <!-- Upper card -->
        <div class="d-flex">
          <Button
            style="--bs-btn-padding-x: 0rem; --bs-btn-padding-y: 0rem;"
            class="me-2"
            color={"light"}
            on:click={() => (isOpen = !isOpen)}
          >
            {#if isOpen}
              <Icon name="chevron-down" />
            {:else}
              <Icon name="chevron-right" />
            {/if}
          </Button>
          <div>
            <div>
              {transactionDetails.payeeName ?? "No payee"}
            </div>
            <div class="text-muted">
              {#if transactionDetails.category}
                {transactionDetails.category.group}:
                {transactionDetails.category.name}
              {:else}
                No category
              {/if}
            </div>
          </div>
          <div class="ms-auto d-inline-flex align-items-center">
            <strong class={amountClass}>
              {transactionDetails.displayAmount}
            </strong>
            <Button class="ms-2" color="success" on:click={logTransaction}>
              {loading ? "..." : "Log"}
            </Button>
          </div>
        </div>
        <!-- Lower card -->
        <Collapse {isOpen} class="mt-2">
          <div class="ms-4">
            <div>
              <span class="text-muted">Budget:</span>
              {transactionDetails.budget.name}
            </div>
            <div>
              <span class="text-muted">Account:</span>
              {transactionDetails.account.name}
            </div>
            <div class="my-1">
              {transactionDetails.memo}
            </div>
            <div>
              <span
                class="badge rounded-pill"
                class:text-bg-success={transactionDetails.cleared}
                class:text-bg-secondary={!transactionDetails.cleared}
              >
                {clearedText}
              </span>
              <span
                class="badge rounded-pill"
                class:text-bg-success={transactionDetails.approved}
                class:text-bg-secondary={!transactionDetails.approved}
              >
                {approvedText}
              </span>
            </div>
            <Button
              class="text-danger"
              style="--bs-btn-padding-x: 0rem;"
              color="link"
              on:click={removeTransaction}
            >
              Delete
            </Button>
          </div>
        </Collapse>
      </div>
    </div>
  </div>
</div>

<style>
  .flag-border {
    border-left-width: 5px;
    border-left-color: var(--flag-color);
  }
</style>
