<script>
  import { flip } from "svelte/animate";

  // Local imports
  import { ynabData } from "../stores";
  import { b64EncodeUnicode, UnicodeDecodeB64 } from "../utils";
  import FreqTransaction from "./FreqTransaction.svelte";

  // Props
  export let frequentTransactions = [];
  export let isEditing = false;

  let encodedTransactions = null;

  /**
   * @param {number} idx Index of the removed transaction
   */
  function removeTransaction(idx) {
    frequentTransactions.splice(idx, 1);
    frequentTransactions = frequentTransactions;
    ynabData.freqTransactions.save(frequentTransactions);
  }

  function swap(idx1, idx2) {
    if (idx2 === 0) {
      return;
    }

    if (idx1 === frequentTransactions.length - 1) {
      return;
    }

    let temp;
    temp = frequentTransactions[idx1];
    frequentTransactions[idx1] = frequentTransactions[idx2];
    frequentTransactions[idx2] = temp;

    ynabData.freqTransactions.save(frequentTransactions);
  }

  function moveUp(idx) {
    swap(idx - 1, idx);
  }

  function moveDown(idx) {
    swap(idx, idx + 1);
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
    {#each frequentTransactions as transactionDetails, idx (transactionDetails.id)}
      <div animate:flip={{ duration: 400 }}>
        <FreqTransaction
          removeTransaction={() => removeTransaction(idx)}
          moveUp={() => moveUp(idx)}
          moveDown={() => moveDown(idx)}
          {isEditing}
          {transactionDetails}
        />
      </div>
    {/each}
    <!-- <Button on:click={exportTransactions}>Export</Button>
    {#if encodedTransactions}
      <details>
        <summary>Copy the code below</summary>
        <textarea readonly rows="5" cols="33">{encodedTransactions}</textarea>
      </details>
    {/if} -->
  {:else}
    <p>No transactions added</p>
    <!-- <div>
      <Button color={"link"} on:click={importTransactions}>
        Import transactions exported from another device
      </Button>
    </div> -->
  {/if}
</div>
