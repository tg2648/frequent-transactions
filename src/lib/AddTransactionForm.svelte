<script>
  import { SaveTransaction } from "ynab";
  import {
    Button,
    Form,
    FormGroup,
    FormText,
    Input,
    Label,
    Icon,
  } from "sveltestrap";

  // Local imports
  import { currTime } from "../stores";
  import { getRelativeTime } from "../utils";

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
  let flag = "";

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
  <FormGroup>
    <div class="row align-items-center">
      <div class="col-auto">
        <Label for="budget">Budget</Label>
      </div>
      <div class="col-auto">
        <div class="input-group">
          <Input
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
          <Button outline size="sm" on:click={refreshHandlers.budgets}>
            <Icon name="arrow-clockwise" />
          </Button>
        </div>
      </div>
      <div class="col-auto">
        {#if refreshTimes.budgets}
          <FormText>
            Last updated {getRelativeTime($currTime, refreshTimes.budgets)}
          </FormText>
        {/if}
      </div>
    </div>
  </FormGroup>

  <FormGroup>
    {#if accounts.length > 0}
      <div class="row align-items-center">
        <div class="col-auto">
          <Label for="account">Account</Label>
        </div>
        <div class="col-auto">
          <div class="input-group">
            <Input
              type="select"
              name="account"
              id="account"
              bind:value={account}
            >
              <option value="" selected />
              {#each accounts as account}
                <option value={account}>
                  {account.name}
                </option>
              {/each}
            </Input>
            <Button outline size="sm" on:click={refreshHandlers.accounts}>
              <Icon name="arrow-clockwise" />
            </Button>
          </div>
        </div>
        <div class="col-auto">
          {#if refreshTimes.accounts}
            <FormText>
              Last updated {getRelativeTime($currTime, refreshTimes.accounts)}
            </FormText>
          {/if}
        </div>
      </div>
    {:else}
      Loading accounts...
    {/if}
  </FormGroup>

  <FormGroup>
    {#if categoryGroups.length > 0}
      <div class="row align-items-center">
        <div class="col-auto">
          <Label for="category">Category</Label>
        </div>
        <div class="col-auto">
          <div class="input-group">
            <Input
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
            <Button outline size="sm" on:click={refreshHandlers.categories}>
              <Icon name="arrow-clockwise" />
            </Button>
          </div>
        </div>
        <div class="col-auto">
          {#if refreshTimes.categories}
            <FormText>
              Last updated {getRelativeTime($currTime, refreshTimes.categories)}
            </FormText>
          {/if}
        </div>
      </div>
    {:else}
      Loading categories...
    {/if}
  </FormGroup>

  <FormGroup>
    <div class="row align-items-center">
      <div class="col-auto">
        <Label for="payee">Payee</Label>
      </div>
      <div class="col-auto">
        <Input bind:value={payeeName} name="payee" id="payee" type="text" />
        <FormText>
          YNAB will create a new payee if a matching payee is not found.
        </FormText>
      </div>
    </div>
  </FormGroup>

  <FormGroup>
    <div class="row align-items-center">
      <div class="col-auto">
        <Label for="amount">Amount</Label>
      </div>
      <div class="col-auto">
        <Input
          bind:value={amount}
          name="amount"
          id="amount"
          type="number"
          step="0.01"
          class={amount >= 0 ? "amount-positive" : "amount-negative"}
          placeholder="0.00"
        />
      </div>
    </div>
  </FormGroup>

  <FormGroup>
    <div class="row align-items-center">
      <div class="col-auto">
        <Label for="memo">Memo</Label>
      </div>
      <div class="col-auto">
        <Input bind:value={memo} name="memo" id="memo" type="text" />
      </div>
    </div>
  </FormGroup>

  <FormGroup>
    <div class="row align-items-center">
      <div class="col-auto">
        <label for="flags">Flags</label>
      </div>
      <div class="col-auto">
        <span id="flags">
          <input
            bind:group={flag}
            style:--flagColor="black"
            class="flag flag-default"
            type="radio"
            name="flag"
            checked
          />
          {#each Object.entries(flagOptions) as [option, color]}
            <input
              bind:group={flag}
              style:--flagColor={color}
              class="flag flag-option"
              type="radio"
              name="flag"
              value={option}
              aria-label={`${option} flag`}
            />
          {/each}
        </span>
      </div>
    </div>
  </FormGroup>

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

<style>
  .flag {
    appearance: none;

    border-radius: 50%;
    width: 16px;
    height: 16px;

    border: 2px solid var(--flagColor);
    transition: 0.05s all linear;
    margin-right: 5px;

    position: relative;
    top: 4px;
  }

  .flag-option:checked {
    border: 8px solid var(--flagColor);
  }
</style>
