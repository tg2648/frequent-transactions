<script>
  // @ts-ignore
  import * as ynab from "ynab";
  import { getContext, onMount } from "svelte";

  // Local imports
  import { config } from "../config";
  import { apiError, ynabData } from "../stores";
  import { convertNumberToMilliUnits, generateId } from "../utils";
  import AddTransactionForm from "./AddTransactionForm.svelte";
  import FreqTransactions from "./FreqTransactions.svelte";

  /** @type { ynab.BudgetSummary } */
  let selectedBudget;
  let selectedBudgetId;
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
    budgets: (event) => {
      event.preventDefault();
      ynabData.budgets.reset();
      getBudgets();
    },
    accounts: (event) => {
      event.preventDefault();
      ynabData.accounts.reset(selectedBudgetId);
      getAccounts(selectedBudgetId);
    },
    categories: (event) => {
      event.preventDefault();
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

    if (cachedData) {
      console.log("Budget cached");
      budgets = cachedData.data;
      selectedBudgetId = ynabData.selectedBudgetId.load().data;
      refreshTimes.budgets = new Date(cachedData.timestamp);
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
          refreshTimes.budgets = ynabData.budgets.save(budgets);
        })
        .catch((err) => {
          apiError.set(err.error.detail);
        });
    }
  }

  function getAccounts(budgetId) {
    console.log(`getAccounts(${budgetId})`);
    let cachedData = ynabData.accounts.load(budgetId);

    if (cachedData) {
      console.log("Accounts cached");
      accounts = cachedData.data;
      refreshTimes.accounts = new Date(cachedData.timestamp);
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
          refreshTimes.accounts = ynabData.accounts.save(accounts, budgetId);
        })
        .catch((err) => {
          apiError.set(err.error.detail);
        });
    }
  }

  function getCategories(budgetId) {
    console.log(`getCategories(${budgetId})`);
    let cachedData = ynabData.categories.load(budgetId);

    if (cachedData) {
      console.log("Categories cached");
      categoryGroups = cachedData.data;
      refreshTimes.categories = new Date(cachedData.timestamp);
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

          refreshTimes.categories = ynabData.categories.save(
            categoryGroups,
            budgetId
          );
        })
        .catch((err) => {
          apiError.set(err.error.detail);
        });
    }
  }

  function addTransaction(newTransaction) {
    newTransaction.id = generateId(6);
    newTransaction.budget = {
      id: selectedBudget.id,
      name: selectedBudget.name,
    };
    newTransaction.milliAmount = convertNumberToMilliUnits(
      newTransaction.amount
    );
    newTransaction.displayAmount = currencyFormatter.format(
      newTransaction.amount
    );

    frequentTransactions = [...frequentTransactions, newTransaction];
    ynabData.freqTransactions.save(frequentTransactions);
  }
</script>

<div>
  <FreqTransactions {frequentTransactions} />
</div>

{#if selectedBudgetId}
  <h4>Add frequent transaction</h4>

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
