<script>
  import { SaveTransaction } from "ynab";
  import { Button, Form, FormGroup, FormText, Input, Icon } from "sveltestrap";

  // Local imports
  import { currTime } from "../stores";
  import { getRelativeTime } from "../utils";
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
  let category = null;
  let payeeName = "";
  let amount = null;
  let memo = "";
  let cleared = false;
  let approved = true;
  let flag = null;

  let flagOptions = {
    [SaveTransaction.FlagColorEnum.Red]: "#ff453a",
    [SaveTransaction.FlagColorEnum.Orange]: "#ff9f0a",
    [SaveTransaction.FlagColorEnum.Yellow]: "#ffd60a",
    [SaveTransaction.FlagColorEnum.Green]: "#32d74b",
    [SaveTransaction.FlagColorEnum.Blue]: "#64d2ff",
    [SaveTransaction.FlagColorEnum.Purple]: "#bf5af2",
  };

  function clickHandler(event) {
    event.preventDefault();

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
  }
</script>

<Form>
  <FormFloatingInputGroup
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

  <FormFloatingInputGroup label="Payee">
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
              <option value={category}>
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
      label={`Account (list refreshed ${getRelativeTime(
        $currTime,
        refreshTimes.accounts
      )})`}
    >
      <Input
        slot="input"
        type="select"
        name="account"
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

  <FormFloatingInputGroup label="Amount">
    <Input
      slot="input"
      bind:value={amount}
      name="amount"
      id="amount"
      type="number"
      step="0.01"
      class={amount >= 0 ? "amount-positive" : "amount-negative"}
    />
  </FormFloatingInputGroup>

  <FormFloatingInputGroup label="Memo">
    <Input slot="input" bind:value={memo} name="memo" id="memo" type="text" />
  </FormFloatingInputGroup>

  <FormFloatingInputGroup label="Flag">
    <Input slot="input" type="select" name="flag" id="flag" bind:value={flag}>
      <option selected value={null} />
      {#each Object.entries(flagOptions) as [option, color]}
        <option value={option} style:color style:font-weight="bold">
          {option.toUpperCase()}
        </option>
      {/each}
    </Input>
  </FormFloatingInputGroup>

  <FormGroup>
    <div class="row align-items-center">
      <div class="col-auto">
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
          style:width="170px"
        >
          {cleared ? "Mark cleared" : "Mark not cleared"}
        </label>
      </div>
      <div class="col-auto">
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
          style:width="170px"
        >
          {approved ? "Mark approved" : "Mark not approved"}
        </label>
      </div>
    </div>
  </FormGroup>

  <Button on:click={clickHandler} color="primary" type="submit">Add</Button>
</Form>
