<script>
  // Local imports
  import { ynabData } from "../stores";
  import { b64EncodeUnicode, UnicodeDecodeB64 } from "../utils";
  import FreqTransaction from "./FreqTransaction.svelte";

  export let frequentTransactions = [];

  let encodedTransactions = null;

  /**
   * @param {number} idx Index of the removed transaction
   */
  function removeTransaction(idx) {
    frequentTransactions.splice(idx, 1);
    frequentTransactions = frequentTransactions;
    ynabData.freqTransactions.save(frequentTransactions);
  }

  function exportTransactions() {
    encodedTransactions = b64EncodeUnicode(
      JSON.stringify(frequentTransactions)
    );
  }

  function importTransactions() {
    frequentTransactions = JSON.parse(
      UnicodeDecodeB64(prompt("Paste the code received from the export step:"))
    );
    ynabData.freqTransactions.save(frequentTransactions);
  }
</script>

<div>
  {#if frequentTransactions.length > 0}
    <h3>Log transaction</h3>
    {#each frequentTransactions as transactionDetails, idx (transactionDetails.id)}
      <FreqTransaction
        removeTransaction={() => removeTransaction(idx)}
        {transactionDetails}
      />
    {/each}
    <button on:click|preventDefault={exportTransactions}>Export</button>
    {#if encodedTransactions}
      <details>
        <summary>Copy the code below</summary>
        <textarea readonly rows="5" cols="33">{encodedTransactions}</textarea>
      </details>
    {/if}
  {:else}
    No transactions
    <button on:click|preventDefault={importTransactions}>Import</button>
  {/if}
</div>
