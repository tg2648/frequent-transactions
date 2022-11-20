<script>
  import FreqTransaction from "./FreqTransaction.svelte";
  import { generateId, convertNumberToMilliUnits } from "../utils";

  // Props
  export let accounts = [];
  export let categories = [];
  export let currencySettings;

  // Transaction parameters
  let account;
  let category;
  let payeeName = "";
  let amount = null;
  let memo = "";

  const currencyFormatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencySettings.iso_code,
  });

  let frequentTransactions =
    JSON.parse(localStorage.getItem("frequentTransactions")) ?? [];

  function addTransaction() {
    let newTransaction = {
      id: generateId(6),
      account: account,
      category: category,
      payeeName: payeeName,
      milliAmount: convertNumberToMilliUnits(amount),
      displayAmount: currencyFormatter.format(amount),
      memo: memo,
    };

    frequentTransactions = [...frequentTransactions, newTransaction];
    localStorage.setItem(
      "frequentTransactions",
      JSON.stringify(frequentTransactions)
    );
  }

  function removeTransaction(idx) {
    frequentTransactions.splice(idx, 1);
    frequentTransactions = frequentTransactions;
    localStorage.setItem(
      "frequentTransactions",
      JSON.stringify(frequentTransactions)
    );
  }
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
  {#if accounts.length > 0}
    <label for="account">Account:</label>
    <select bind:value={account} name="account" id="account">
      {#each accounts as account}
        <option value={account}>
          {account.name}
        </option>
      {/each}
    </select>
  {:else}
    Loading accounts...
  {/if}

  {#if categories.length > 0}
    <label for="category">Category:</label>
    <select bind:value={category} name="category" id="category">
      {#each categories as category}
        <option value={category}>
          {category.name}
        </option>
      {/each}
    </select>
  {:else}
    Loading categories...
  {/if}

  <label for="payee">Payee:</label>
  <input bind:value={payeeName} name="payee" id="payee" />

  <label for="amount">Amount:</label>
  <input
    bind:value={amount}
    type="number"
    name="amount"
    id="amount"
    step="0.01"
    placeholder="0.00"
  />

  <label for="memo">Memo:</label>
  <input bind:value={memo} name="memo" id="memo" />

  <button on:click|preventDefault={addTransaction} type="submit">Add</button>
</form>
