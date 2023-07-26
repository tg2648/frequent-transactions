import { writable, readable } from "svelte/store";
import { refreshToken } from "./auth";

// Svelte stores
export const apiError = writable(null);
export const apiErrorType = writable(null);

/**
 * https://svelte.dev/tutorial/readable-stores
 */
export const currTime = readable(new Date(), function start(set) {
  const interval = setInterval(() => {
    set(new Date());
  }, 1000);

  return function stop() {
    clearInterval(interval);
  };
});

// Local/session storage-based stores
const DATA_VERSION = 1;
const SELECTED_BUDGET_ID_KEY = "selectedBudgetId";
const BUDGETS_STORAGE_KEY = "allBudgets";
const ACCOUNTS_STORAGE_KEY = "accounts";
const CATEGORIES_STORAGE_KEY = "categories";
const FREQ_TRAN_STORAGE_KEY = "frequentTransactions";
const TOKEN_SESSION_DATA_KEY = "ftfy-session";
const TOKEN_EXPIRATION_WINDOW_SECS = 300;

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

  token: {
    /**
     * Get token from session storage refreshing it, if necessary.
     */
    load: async () => {
      const tokenData = JSON.parse(
        localStorage.getItem(TOKEN_SESSION_DATA_KEY)
      );

      if (tokenData === null) {
        return null;
      }

      // If there is a token in storage, try to refresh it if it expired
      const expiresAt = new Date(tokenData.expires_at);
      const timeDelta =
        expiresAt.valueOf() -
        (Date.now() + TOKEN_EXPIRATION_WINDOW_SECS * 1000);

      if (timeDelta <= 0) {
        console.log("Token expired");

        const newTokenData = await refreshToken(tokenData);
        if (newTokenData) {
          ynabData.token.save(newTokenData);
          return newTokenData;
        } else {
          // If token could not be refreshed, return old token and prompt user to re-login
          apiErrorType.set("unauthorized");
          apiError.set(
            "Unable to authorize with YNAB. Please try to re-login:"
          );
          return tokenData;
        }
      } else {
        console.log("Token fresh");
        return tokenData;
      }
    },
    save: (tokenData) => {
      localStorage.setItem(TOKEN_SESSION_DATA_KEY, JSON.stringify(tokenData));
    },
    reset: () => {
      localStorage.removeItem(TOKEN_SESSION_DATA_KEY);
    },
  },
};
