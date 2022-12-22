<script>
  import { Button, Form, FormGroup, FormText, Input, Icon } from "sveltestrap";

  // Local imports
  import { currTime } from "../stores";
  import { getRelativeTime } from "../utils";
  import { ynabFlagColors } from "../utils";
  import FormFloatingInputGroup from "./FormFloatingInputGroup.svelte";

  // Props
  export let selectedBudgetId;
  export let budgets = [];
  export let accounts = [];
  export let categoryGroups = [];
  export let addTransaction = (newTransaction) => {};
  export let refreshHandlers = null;
  export let refreshTimes = null;

  // Transaction parameters
  let account = null;
  let category = null; // Includes category group information
  let payeeName = null;
  let amount = null;
  let flag = null;
  let memo = "";
  let cleared = false;
  let approved = true;

  let formErrors = {};
  let isAmountOutflow = true;
  let amountClassValue;
  let amountClassError;
  $: amountClassValue = isAmountOutflow ? "amount-negative" : "amount-positive";
  $: amountClassError = formErrors?.amount ? "is-invalid" : "";
  $: amount = amount < 0 ? -amount : amount; // Only allow positive values in form

  function makeAmountInflow(event) {
    event.preventDefault();
    isAmountOutflow = false;
  }

  function makeAmountOutflow(event) {
    event.preventDefault();
    isAmountOutflow = true;
  }

  function submitForm(event) {
    event.preventDefault();
    formErrors = {};

    if (amount === null) {
      formErrors.amount = "Amount required";
    }

    if (account === null) {
      formErrors.account = "Account required";
    }

    // Convert amount to negative if amount exists, not zero, and marked as outflow
    if (amount && isAmountOutflow && amount !== 0) {
      amount = -amount;
    }

    if (Object.keys(formErrors).length === 0) {
      let newTransaction = {
        account: account,
        category: category,
        payeeName: payeeName,
        amount: amount,
        memo: memo,
        cleared: cleared,
        approved: approved,
        flag: flag,
      };

      addTransaction(newTransaction);
      clearForm();
    }
  }

  function clearForm(event) {
    if (event) {
      event.preventDefault();
    }
    account = null;
    category = null;
    payeeName = null;
    amount = null;
    flag = null;
    memo = "";
    cleared = false;
    approved = true;

    formErrors = {};
  }
</script>

<div class="row">
  <div class="col">
    <Form>
      <FormFloatingInputGroup
        id="budget"
        cls="mb-2"
        label={`Budget (list refreshed ${getRelativeTime(
          $currTime,
          refreshTimes.budgets
        )})`}
      >
        <Input
          slot="input"
          type="select"
          name="budget"
          id="budget"
          bind:value={selectedBudgetId}
        >
          {#each budgets as budget}
            <option value={budget.id}>
              {budget.name}
            </option>
          {/each}
        </Input>
        <Button
          slot="right-addon"
          outline
          size="sm"
          on:click={refreshHandlers.budgets}
        >
          <Icon name="arrow-clockwise" />
        </Button>
      </FormFloatingInputGroup>

      <FormFloatingInputGroup id="payee" label="Payee" cls="mb-2">
        <Input
          slot="input"
          bind:value={payeeName}
          id="payee"
          type="text"
          name="payee"
        />
        <FormText slot="text">
          YNAB will create a new payee if a matching payee is not found.
        </FormText>
      </FormFloatingInputGroup>

      <div class="row g-1">
        <div class="col-md-6">
          {#if categoryGroups.length > 0}
            <FormFloatingInputGroup
              id="category"
              cls="mb-2"
              label={`Category (list refreshed ${getRelativeTime(
                $currTime,
                refreshTimes.categories
              )})`}
            >
              <Input
                slot="input"
                type="select"
                name="category"
                id="category"
                bind:value={category}
              >
                <option value="" selected />
                {#each categoryGroups as categoryGroup}
                  <optgroup label={categoryGroup.name}>
                    {#each categoryGroup.categories as category}
                      <option
                        value={{
                          name: category.name,
                          id: category.id,
                          group: categoryGroup.name,
                        }}
                      >
                        {category.name}
                      </option>
                    {/each}
                  </optgroup>
                {/each}
              </Input>
              <Button
                slot="right-addon"
                outline
                size="sm"
                on:click={refreshHandlers.categories}
              >
                <Icon name="arrow-clockwise" />
              </Button>
            </FormFloatingInputGroup>
          {:else}
            Loading accounts...
          {/if}
        </div>
        <div class="col-md-6">
          {#if accounts.length > 0}
            <FormFloatingInputGroup
              id="account"
              cls="mb-2"
              error={formErrors?.account}
              label={`Account (list refreshed ${getRelativeTime(
                $currTime,
                refreshTimes.accounts
              )})`}
            >
              <Input
                slot="input"
                type="select"
                name="account"
                class={formErrors?.account ? "is-invalid" : ""}
                id="account"
                bind:value={account}
              >
                {#each accounts as account}
                  <option value={account}>
                    {account.name}
                  </option>
                {/each}
              </Input>
              <Button
                slot="right-addon"
                outline
                size="sm"
                on:click={refreshHandlers.accounts}
              >
                <Icon name="arrow-clockwise" />
              </Button>
            </FormFloatingInputGroup>
          {:else}
            Loading accounts...
          {/if}
        </div>
      </div>

      <div class="row g-1 mb-2">
        <div class="col-sm-9 col-7">
          <FormFloatingInputGroup
            error={formErrors?.amount}
            id="amount"
            label="Amount"
          >
            <Input
              slot="input"
              bind:value={amount}
              name="amount"
              id="amount"
              type="number"
              step="0.01"
              class={`${amountClassValue} ${amountClassError}`}
            />
          </FormFloatingInputGroup>
        </div>
        <div class="col-sm-3 col-5 d-grid gap-1" style="max-height:60px;">
          <Button
            style="--bs-btn-padding-x: 0.5rem; --bs-btn-padding-y: 0rem;"
            color="success"
            size="sm"
            outline={isAmountOutflow}
            on:click={makeAmountInflow}
          >
            + Inflow
          </Button>
          <Button
            style="--bs-btn-padding-x: 0.5rem; --bs-btn-padding-y: 0rem;"
            color="danger"
            size="sm"
            outline={!isAmountOutflow}
            on:click={makeAmountOutflow}
          >
            - Outflow
          </Button>
        </div>
      </div>

      <div class="row g-1">
        <div class="col-sm-9 col-7">
          <FormFloatingInputGroup id="memo" label="Memo" cls="mb-2">
            <Input
              slot="input"
              bind:value={memo}
              name="memo"
              id="memo"
              type="text"
            />
          </FormFloatingInputGroup>
        </div>
        <div class="col-sm-3 col-5">
          <FormFloatingInputGroup id="flag" label="Flag" cls="mb-2">
            <Input
              slot="input"
              type="select"
              name="flag"
              id="flag"
              bind:value={flag}
            >
              <option selected value={null} />
              {#each Object.entries(ynabFlagColors) as [option, color]}
                <option value={option} style:color style:font-weight="bold">
                  {option.toUpperCase()}
                </option>
              {/each}
            </Input>
          </FormFloatingInputGroup>
        </div>
      </div>

      <FormGroup>
        <div>
          <input
            type="checkbox"
            class="btn-check"
            name="cleared"
            id="cleared"
            autocomplete="off"
            bind:checked={cleared}
          />
          <label
            class="btn"
            class:btn-outline-success={cleared}
            class:btn-outline-secondary={!cleared}
            for="cleared"
          >
            {cleared ? "Cleared" : "Not cleared"}
          </label>
          <input
            type="checkbox"
            class="btn-check"
            name="approved"
            id="approved"
            autocomplete="off"
            bind:checked={approved}
          />
          <label
            class="btn"
            class:btn-outline-success={approved}
            class:btn-outline-secondary={!approved}
            for="approved"
          >
            {approved ? "Approved" : "Not approved"}
          </label>
        </div>
        <FormText>
          Transactions marked as approved will not require explicit approval or
          rejection after logging.
        </FormText>
      </FormGroup>

      <Button on:click={submitForm} color="primary" type="submit">Add</Button>
      <Button on:click={clearForm} color="secondary">Clear</Button>
    </Form>
  </div>
</div>
