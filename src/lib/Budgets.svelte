<script>
  // @ts-ignore
  import * as ynab from "ynab";
  import { getContext, onMount } from "svelte";

  // Local imports
  import { config } from "../config";
  import { apiError, ynabData } from "../stores";
  import {
    convertNumberToMilliUnits,
    generateId,
    getRelativeTime,
  } from "../utils";
  import AddTransactionForm from "./AddTransactionForm.svelte";
  import FreqTransaction from "./FreqTransaction.svelte";

  /** @type { ynab.BudgetSummary } */
  let selectedBudget;
  let selectedBudgetId = ynabData.selectedBudgetId.load().data;
  let currencyFormatter;

  /** @type { Array<ynab.BudgetSummary> } */
  let budgets = [];
  let accounts = [];
  let categoryGroups = [];

  const { getApi } = getContext(config.context_key);
  /** @type { ynab.api } */
  const ynabApi = getApi();

  $: if (selectedBudgetId) {
    selectedBudget = budgets.filter(
      (budget) => budget.id === selectedBudgetId
    )[0];
  }

  $: currencyFormatter = currencyFormatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: selectedBudget?.currency_format.iso_code ?? "USD",
  });

  $: if (selectedBudgetId) {
    getAccounts(selectedBudgetId);
    getCategories(selectedBudgetId);
  }

  let frequentTransactions = ynabData.freqTransactions.load();

  let refreshHandlers = {
    budgets: () => {
      ynabData.budgets.reset();
      getBudgets();
    },
    accounts: () => {
      ynabData.accounts.reset(selectedBudgetId);
      getAccounts(selectedBudgetId);
    },
    categories: () => {
      ynabData.categories.reset(selectedBudgetId);
      getCategories(selectedBudgetId);
    },
  };

  let refreshTimes = {};

  onMount(() => {
    getBudgets();
  });

  function getBudgets() {
    console.log("getBudgets()");
    let cachedData = ynabData.budgets.load();
    let refreshTimestamp;

    if (cachedData) {
      console.log("Budget cached");
      budgets = cachedData.data;
      refreshTimestamp = new Date(cachedData.timestamp);
      refreshTimes.budgets = getRelativeTime(new Date(), refreshTimestamp);
    } else {
      console.log("Calling budget endpoint");
      ynabApi.budgets
        .getBudgets()
        .then((res) => {
          if (!selectedBudgetId) {
            selectedBudgetId = res.data.default_budget.id;
          }
          ynabData.selectedBudgetId.save(selectedBudgetId);
          budgets = res.data.budgets;
          refreshTimestamp = ynabData.budgets.save(budgets);
          refreshTimes.budgets = getRelativeTime(new Date(), refreshTimestamp);
        })
        .catch((err) => {
          apiError.set(err.error.detail);
        });
    }
  }

  function getAccounts(budgetId) {
    console.log(`getAccounts(${budgetId})`);
    let cachedData = ynabData.accounts.load(budgetId);
    let refreshTimestamp;

    if (cachedData) {
      console.log("Accounts cached");
      accounts = cachedData.data;
      refreshTimestamp = new Date(cachedData.timestamp);
      refreshTimes.accounts = getRelativeTime(new Date(), refreshTimestamp);
    } else {
      console.log("Calling accounts endpoint");
      ynabApi.accounts
        .getAccounts(budgetId)
        .then((res) => {
          accounts = res.data.accounts.map((account) => ({
            id: account.id,
            name: account.name,
          }));
          accounts.sort((a, b) => a.name.localeCompare(b.name));
          refreshTimestamp = ynabData.accounts.save(accounts, budgetId);
          refreshTimes.accounts = getRelativeTime(new Date(), refreshTimestamp);
        })
        .catch((err) => {
          apiError.set(err.error.detail);
        });
    }
  }

  function getCategories(budgetId) {
    console.log(`getCategories(${budgetId})`);
    let cachedData = ynabData.categories.load(budgetId);
    let refreshTimestamp;

    if (cachedData) {
      console.log("Categories cached");
      categoryGroups = cachedData.data;
      refreshTimestamp = new Date(cachedData.timestamp);
      refreshTimes.categories = getRelativeTime(new Date(), refreshTimestamp);
    } else {
      console.log("Calling categories endpoint");
      ynabApi.categories
        .getCategories(budgetId)
        .then((res) => {
          /**
           * Clean up categories:
           * 1. Exclude deleted or hidden
           * 2. Keep only name of category group and id and name of category
           */
          categoryGroups = res.data.category_groups
            .filter(
              (categoryGroup) =>
                !categoryGroup.deleted &&
                !categoryGroup.hidden &&
                categoryGroup.name !== "Hidden Categories"
            )
            .map((categoryGroup) => ({
              name: categoryGroup.name.startsWith("Internal")
                ? "Internal"
                : categoryGroup.name,
              categories: categoryGroup.categories
                .filter((category) => !category.deleted && !category.hidden)
                .map((category) => ({
                  id: category.id,
                  name: category.name,
                })),
            }));

          refreshTimestamp = ynabData.categories.save(categoryGroups, budgetId);
          refreshTimes.categories = getRelativeTime(
            new Date(),
            refreshTimestamp
          );
        })
        .catch((err) => {
          apiError.set(err.error.detail);
        });
    }
  }

  function addTransaction(newTransaction) {
    newTransaction.id = generateId(6);
    newTransaction.budget = selectedBudget;
    newTransaction.milliAmount = convertNumberToMilliUnits(
      newTransaction.amount
    );
    newTransaction.displayAmount = currencyFormatter.format(
      newTransaction.amount
    );

    frequentTransactions = [...frequentTransactions, newTransaction];
    ynabData.freqTransactions.save(frequentTransactions);
  }

  /**
   * @param {number} idx Index of the removed transaction
   */
  function removeTransaction(idx) {
    frequentTransactions.splice(idx, 1);
    frequentTransactions = frequentTransactions;
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
  {/if}
</div>

{#if selectedBudgetId}
  <h3>Add frequent transaction</h3>

  <p>
    YNAB will find an existing payee matching the provided name or create a new
    payee.
  </p>

  <AddTransactionForm
    bind:selectedBudgetId
    {budgets}
    {accounts}
    {categoryGroups}
    {addTransaction}
    {refreshHandlers}
    {refreshTimes}
  />
{:else}
  <p>Loading...</p>
{/if}
