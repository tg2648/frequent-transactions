<script>
  import { SaveTransaction } from "ynab";
  import { Button } from "sveltestrap";

  // Local imports
  import { ynabData, currTime } from "../stores";
  import { getRelativeTime } from "../utils";

  // Props
  export let selectedBudgetId = null;
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

<form>
  <div>
    <label for="budget">Budget:</label>
    <select
      bind:value={selectedBudgetId}
      on:change={() => ynabData.selectedBudgetId.save(selectedBudgetId)}
      name="budget"
      id="budget"
    >
      {#each budgets as budget}
        <option value={budget.id}>
          {budget.name}
        </option>
      {/each}
    </select>
    <Button on:click={refreshHandlers.budgets}>Refresh budgets</Button>
    {#if refreshTimes.budgets}
      <span>
        Last updated {getRelativeTime($currTime, refreshTimes.budgets)}
      </span>
    {/if}
  </div>

  <div>
    {#if accounts.length > 0}
      <label for="account">Account:</label>
      <select bind:value={account} name="account" id="account">
        <option value="" selected />
        {#each accounts as account}
          <option value={account}>
            {account.name}
          </option>
        {/each}
      </select>
      <Button on:click={refreshHandlers.accounts}>Refresh accounts</Button>
      {#if refreshTimes.accounts}
        <span>
          Last updated {getRelativeTime($currTime, refreshTimes.accounts)}
        </span>
      {/if}
    {:else}
      Loading accounts...
    {/if}
  </div>

  <div>
    {#if categoryGroups.length > 0}
      <label for="category">Category:</label>
      <select bind:value={category} name="category" id="category">
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
      </select>
      <Button on:click={refreshHandlers.categories}>Refresh categories</Button>
      {#if refreshTimes.categories}
        <span>
          Last updated {getRelativeTime($currTime, refreshTimes.categories)}
        </span>
      {/if}
    {:else}
      Loading categories...
    {/if}
  </div>

  <div>
    <label for="payee">Payee:</label>
    <input bind:value={payeeName} name="payee" id="payee" />
  </div>

  <div>
    <label for="amount">Amount:</label>
    <input
      bind:value={amount}
      type="number"
      name="amount"
      id="amount"
      step="0.01"
      placeholder="0.00"
    />
  </div>

  <div>
    <label for="memo">Memo:</label>
    <input bind:value={memo} name="memo" id="memo" />
  </div>

  <div>
    <label for="cleared">Cleared:</label>
    <input bind:checked={cleared} type="checkbox" name="cleared" id="cleared" />
  </div>

  <div>
    <label for="approved">Approved:</label>
    <input
      bind:checked={approved}
      type="checkbox"
      name="approved"
      id="approved"
    />
  </div>

  <div>
    <label for="flags">Flag:</label>
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
        />
      {/each}
    </span>
  </div>

  <Button on:click={(event) => clickHandler(event)} type="submit">Add</Button>
</form>

<style>
  .flag {
    appearance: none;

    border-radius: 50%;
    width: 16px;
    height: 16px;

    border: 2px solid var(--flagColor);
    transition: 0.2s all linear;
    margin-right: 5px;

    position: relative;
    top: 4px;
  }

  .flag-option:checked {
    border: 6px solid var(--flagColor);
  }
</style>
