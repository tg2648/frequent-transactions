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
  let amountClassValue;
  let amountClassError;
  $: amountClassValue = amount >= 0 ? "amount-positive" : "amount-negative";
  $: amountClassError = formErrors?.amount ? "is-invalid" : "";

  function clickHandler(event) {
    event.preventDefault();
    formErrors = {};

    console.log(formErrors);
    if (amount === null) {
      formErrors.amount = "Amount required";
    }

    if (account === null) {
      formErrors.account = "Account required";
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
      formErrors = {};
    }
  }
</script>

<div class="row">
  <div class="col-lg-7">
    <Form>
      <FormFloatingInputGroup
        id="budget"
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

      <FormFloatingInputGroup id="payee" label="Payee">
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

      {#if categoryGroups.length > 0}
        <FormFloatingInputGroup
          id="category"
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

      {#if accounts.length > 0}
        <FormFloatingInputGroup
          id="account"
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

      <FormFloatingInputGroup id="memo" label="Memo">
        <Input
          slot="input"
          bind:value={memo}
          name="memo"
          id="memo"
          type="text"
        />
      </FormFloatingInputGroup>

      <FormFloatingInputGroup id="flag" label="Flag">
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

      <FormGroup>
        <div class="d-grid gap-2 d-sm-block">
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
      </FormGroup>

      <Button on:click={clickHandler} color="primary" type="submit">Add</Button>
    </Form>
  </div>
</div>
