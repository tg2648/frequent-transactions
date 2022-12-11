import { writable } from "svelte/store";

// Svelte stores
export const apiError = writable(null);

// Custom stores
const DATA_VERSION = 1;
const SELECTED_BUDGET_ID_KEY = "selectedBudgetId";
const BUDGETS_STORAGE_KEY = "allBudgets";
const ACCOUNTS_STORAGE_KEY = "accounts";
const CATEGORIES_STORAGE_KEY = "categories";
const FREQ_TRAN_STORAGE_KEY = "frequentTransactions";

/**
 * Helper for adding versioned data to local storage
 *
 * @param {string} key Storage key
 * @param {object} data Data to save
 * @param {number} version Version of data
 * @return {Date} Storage timestamp
 */
function addToLocalStorage(key, data, version) {
  let timestamp = new Date();

  localStorage.setItem(
    `${key}_${version}`,
    JSON.stringify({ data: data, timestamp: timestamp })
  );

  return timestamp;
}

/**
 * Helper for retrieving versioned data from local storage
 *
 * @param {string} key Storage key
 * @param {number} version Version of data
 * @returns {object} Object of type `{data: {}, timestamp: string}`
 */
function getFromLocalStorage(key, version) {
  return JSON.parse(localStorage.getItem(`${key}_${version}`));
}

export const ynabData = {
  budgets: {
    load: () => getFromLocalStorage(BUDGETS_STORAGE_KEY, DATA_VERSION) ?? null,
    save: (budgets) =>
      addToLocalStorage(BUDGETS_STORAGE_KEY, budgets, DATA_VERSION),
    reset: () =>
      localStorage.removeItem(`${BUDGETS_STORAGE_KEY}_${DATA_VERSION}`),
  },

  selectedBudgetId: {
    load: () =>
      getFromLocalStorage(SELECTED_BUDGET_ID_KEY, DATA_VERSION) ?? null,
    save: (id) => addToLocalStorage(SELECTED_BUDGET_ID_KEY, id, DATA_VERSION),
    reset: () =>
      localStorage.removeItem(`${SELECTED_BUDGET_ID_KEY}_${DATA_VERSION}`),
  },

  freqTransactions: {
    load: () =>
      getFromLocalStorage(FREQ_TRAN_STORAGE_KEY, DATA_VERSION)?.data ?? [],
    save: (transactions) =>
      addToLocalStorage(FREQ_TRAN_STORAGE_KEY, transactions, DATA_VERSION),
    reset: () =>
      localStorage.removeItem(`${FREQ_TRAN_STORAGE_KEY}_${DATA_VERSION}`),
  },

  accounts: {
    load: (budgetId) =>
      getFromLocalStorage(
        `${ACCOUNTS_STORAGE_KEY}_${budgetId}`,
        DATA_VERSION
      ) ?? null,
    save: (accounts, budgetId) =>
      addToLocalStorage(
        `${ACCOUNTS_STORAGE_KEY}_${budgetId}`,
        accounts,
        DATA_VERSION
      ),
    reset: (budgetId) =>
      localStorage.removeItem(
        `${ACCOUNTS_STORAGE_KEY}_${budgetId}_${DATA_VERSION}`
      ),
  },

  categories: {
    load: (budgetId) =>
      getFromLocalStorage(
        `${CATEGORIES_STORAGE_KEY}_${budgetId}`,
        DATA_VERSION
      ) ?? null,
    save: (categories, budgetId) =>
      addToLocalStorage(
        `${CATEGORIES_STORAGE_KEY}_${budgetId}`,
        categories,
        DATA_VERSION
      ),
    reset: (budgetId) =>
      localStorage.removeItem(
        `${CATEGORIES_STORAGE_KEY}_${budgetId}_${DATA_VERSION}`
      ),
  },
};
