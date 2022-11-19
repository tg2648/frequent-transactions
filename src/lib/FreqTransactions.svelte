<script>
  import FreqTransaction from "./FreqTransaction.svelte";
  import { generateId, convertNumberToMilliUnits } from "../utils";

  // Props
  export let accounts = [];
  export let currencySettings;

  let account = null;
  let payeeName = null;
  let amount = null;

  const currencyFormatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencySettings.iso_code,
  });

  let frequentTransactions = [
    {
      id: generateId(6),
      account: { id: "1", name: "One" },
      payeeName: "Two",
      milliAmount: convertNumberToMilliUnits(123.93),
      displayAmount: currencyFormatter.format(123.93),
    },
    {
      id: generateId(6),
      account: { id: "2", name: "Acc" },
      payeeName: "Paay",
      milliAmount: convertNumberToMilliUnits(-4925.24),
      displayAmount: currencyFormatter.format(-4925.24),
    },
  ];

  function addTransaction() {
    let newTransaction = {
      id: generateId(6),
      account: account,
      payeeName: payeeName,
      milliAmount: convertNumberToMilliUnits(amount),
      displayAmount: currencyFormatter.format(amount),
    };

    frequentTransactions = [...frequentTransactions, newTransaction];
  }

  function removeTransaction(idx) {
    frequentTransactions.splice(idx, 1);
    frequentTransactions = frequentTransactions;
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

  <button on:click|preventDefault={addTransaction} type="submit">Add</button>
</form>
