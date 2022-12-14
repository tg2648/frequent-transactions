<script>
  import * as ynab from "ynab";
  import { onMount } from "svelte";
  import { Button, Modal, ModalBody, ModalHeader } from "sveltestrap";

  // Local imports
  import { apiError, apiErrorType, ynabData } from "../stores";
  import { convertNumberToMilliUnits, generateId } from "../utils";
  import AddTransactionForm from "./AddTransactionForm.svelte";
  import FreqTransactions from "./FreqTransactions.svelte";

  /** @type { ynab.BudgetSummary } */
  let selectedBudget;
  let selectedBudgetId;
  let currencyFormatter;
  let isEditing = false;
  let isFormOpen = false;

  /** @type { Array<ynab.BudgetSummary> } */
  let budgets = [];
  let accounts = [];
  let categoryGroups = [];

  // Update budget data whenever budget selection changes
  $: if (selectedBudgetId) {
    selectedBudget = budgets.filter(
      (budget) => budget.id === selectedBudgetId
    )[0];
  }

  // Update currency formatter whenever budget changes
  $: currencyFormatter = currencyFormatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: selectedBudget?.currency_format.iso_code ?? "USD",
  });

  // Fetch accounts and categories whenever budget changes
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

  async function getBudgets() {
    console.log("getBudgets()");
    let cachedData = ynabData.budgets.load();

    if (cachedData) {
      console.log("Budget cached");
      budgets = cachedData.data;
      selectedBudgetId = ynabData.selectedBudgetId.load().data;
      refreshTimes.budgets = new Date(cachedData.timestamp);
    } else {
      console.log("Calling budget endpoint");
      const token = await ynabData.token.load();

      if ($apiErrorType !== "unauthorized") {
        const ynabApi = new ynab.API(token.access_token);
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
  }

  async function getAccounts(budgetId) {
    console.log(`getAccounts(${budgetId})`);
    let cachedData = ynabData.accounts.load(budgetId);

    if (cachedData) {
      console.log("Accounts cached");
      accounts = cachedData.data;
      refreshTimes.accounts = new Date(cachedData.timestamp);
    } else {
      console.log("Calling accounts endpoint");
      const token = await ynabData.token.load();

      if ($apiErrorType !== "unauthorized") {
        const ynabApi = new ynab.API(token.access_token);
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
  }

  async function getCategories(budgetId) {
    console.log(`getCategories(${budgetId})`);
    let cachedData = ynabData.categories.load(budgetId);

    if (cachedData) {
      console.log("Categories cached");
      categoryGroups = cachedData.data;
      refreshTimes.categories = new Date(cachedData.timestamp);
    } else {
      console.log("Calling categories endpoint");
      const token = await ynabData.token.load();

      if ($apiErrorType !== "unauthorized") {
        const ynabApi = new ynab.API(token.access_token);
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

    frequentTransactions = [newTransaction, ...frequentTransactions];
    ynabData.freqTransactions.save(frequentTransactions);

    // Close modal
    toggleFormModal();
  }

  function toggleFormModal() {
    isFormOpen = !isFormOpen;
  }
</script>

<div>
  <FreqTransactions {frequentTransactions} {isEditing} />
</div>
<div>
  <Button color="primary" on:click={toggleFormModal}>Add new</Button>
  {#if frequentTransactions.length > 0}
    <Button
      color="secondary"
      on:click={() => {
        isEditing = !isEditing;
      }}
    >
      {isEditing ? "Stop editing" : "Edit list"}
    </Button>
  {/if}
</div>
{#if selectedBudgetId}
  <Modal
    isOpen={isFormOpen}
    toggle={toggleFormModal}
    fullscreen={"lg"}
    size={"lg"}
  >
    <ModalHeader toggle={toggleFormModal}>Add frequent transaction</ModalHeader>
    <ModalBody>
      <AddTransactionForm
        bind:selectedBudgetId
        {budgets}
        {accounts}
        {categoryGroups}
        {addTransaction}
        {refreshHandlers}
        {refreshTimes}
      />
    </ModalBody>
  </Modal>
{:else}
  <p>Loading...</p>
{/if}
