<script>
  import { afterUpdate } from "svelte";
  import { SaveTransaction } from "ynab";
  import FreqTransaction from "./FreqTransaction.svelte";
  import {
    generateId,
    convertNumberToMilliUnits,
    getFromLocalStorage,
    DATA_VERSION,
    FREQ_TRANSACTIONS_STORAGE_KEY,
    addToLocalStorage,
  } from "../utils";

  // Props
  export let accounts = [];
  export let categoryGroups = [];
  export let currencySettings;

  // Transaction parameters
  let account;
  let category;
  let payeeName = "";
  let amount = null;
  let memo = "";
  let cleared = false;
  let approved = true;
  let flag;

  let flagOptions = {
    [SaveTransaction.FlagColorEnum.Red]: "#ff453a",
    [SaveTransaction.FlagColorEnum.Orange]: "#ff9f0a",
    [SaveTransaction.FlagColorEnum.Yellow]: "#ffd60a",
    [SaveTransaction.FlagColorEnum.Green]: "#32d74b",
    [SaveTransaction.FlagColorEnum.Blue]: "#64d2ff",
    [SaveTransaction.FlagColorEnum.Purple]: "#bf5af2",
  };

  const currencyFormatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencySettings.iso_code,
  });

  let frequentTransactions =
    getFromLocalStorage(FREQ_TRANSACTIONS_STORAGE_KEY, DATA_VERSION)?.data ??
    [];

  function addTransaction() {
    let newTransaction = {
      id: generateId(6),
      account: account,
      category: category,
      payeeName: payeeName,
      milliAmount: convertNumberToMilliUnits(amount),
      displayAmount: currencyFormatter.format(amount),
      memo: memo,
      cleared: cleared,
      approved: approved,
      flag: flag,
    };

    frequentTransactions = [...frequentTransactions, newTransaction];
  }

  function removeTransaction(idx) {
    frequentTransactions.splice(idx, 1);
    frequentTransactions = frequentTransactions;
  }

  afterUpdate(() => {
    addToLocalStorage(
      FREQ_TRANSACTIONS_STORAGE_KEY,
      frequentTransactions,
      DATA_VERSION
    );
  });
</script>

<div>
  {#if frequentTransactions.length > 0}
    <h3>Log transaction</h3>
    {#each frequentTransactions as transaction, idx (transaction.id)}
      <FreqTransaction
        removeTransaction={() => removeTransaction(idx)}
        {transaction}
      />
    {/each}
  {/if}
</div>

<h3>Add frequent transaction</h3>

<p>
  YNAB will find an existing payee matching the provided name or create a new
  payee.
</p>

<form>
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

  <button on:click|preventDefault={addTransaction} type="submit">Add</button>
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
