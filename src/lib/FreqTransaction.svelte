<script>
  // @ts-ignore
  import * as ynab from "ynab";
  import { getContext } from "svelte";
  import { Button, Icon, Collapse } from "sveltestrap";

  // Local imports
  import { ynabData, apiError, apiErrorType } from "../stores";
  import { ynabFlagColors } from "../utils";

  // Props
  export let transactionDetails, removeTransaction, moveUp, moveDown, isEditing;

  let loading = false;
  let isLogged = false;
  let isCollapseOpen = false;
  let amountClass =
    transactionDetails.milliAmount < 0 ? "amount-negative" : "amount-positive";
  let approvedText = transactionDetails.approved ? "Approved" : "Not approved";
  let clearedText = transactionDetails.cleared ? "Cleared" : "Not cleared";

  async function logTransaction() {
    loading = true;
    const token = await ynabData.token.load();

    if (token) {
      const ynabApi = new ynab.API(token.access_token);
      ynabApi.transactions
        .createTransaction(transactionDetails.budget.id, {
          transaction: {
            account_id: transactionDetails.account.id,
            category_id: transactionDetails.category?.id,
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
          isLogged = true;
          setTimeout(() => (isLogged = false), 2000);
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

<div
  style:--flag-color={ynabFlagColors[transactionDetails.flag]}
  class:flag-border={transactionDetails.flag}
  class="card text-bg-light mb-3"
>
  <div class="card-body">
    <!-- Upper card -->
    <div class="d-flex">
      {#if !isEditing}
        <Button
          style="--bs-btn-padding-x: 0rem; --bs-btn-padding-y: 0rem;"
          class="me-2"
          color={"light"}
          on:click={() => (isCollapseOpen = !isCollapseOpen)}
        >
          {#if isCollapseOpen}
            <Icon name="chevron-down" />
          {:else}
            <Icon name="chevron-right" />
          {/if}
        </Button>
      {/if}

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

      <div class="ms-auto d-inline-flex align-items-center gap-2">
        {#if isEditing}
          <Button color="danger" on:click={removeTransaction}>
            <Icon name="trash-fill" />
          </Button>
          <Button on:click={moveUp}>
            <Icon name="arrow-up" />
          </Button>
          <Button on:click={moveDown}>
            <Icon name="arrow-down" />
          </Button>
        {:else}
          <strong class={`text-nowrap ${amountClass}`}>
            {transactionDetails.displayAmount}
          </strong>
          <Button
            class="ms-2"
            disabled={isLogged || loading}
            color={isLogged ? "success" : "primary"}
            on:click={logTransaction}
          >
            {isLogged ? "Logged!" : loading ? "Logging..." : "Log"}
          </Button>
        {/if}
      </div>
    </div>

    <!-- Lower card -->
    {#if !isEditing}
      <Collapse isOpen={isCollapseOpen} class="mt-2">
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
        </div>
      </Collapse>
    {/if}
  </div>
</div>

<style>
  .flag-border {
    border-left-width: 5px;
    border-left-color: var(--flag-color);
  }
</style>
