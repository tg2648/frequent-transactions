/**
 * Constants and helper functions for working with data
 */

export const DATA_VERSION = 1;

export const DEFAULT_BUDGET_STORAGE_KEY = "defaultBudget";
export const SELECTED_BUDGET_ID_KEY = "selectedBudgetId";
export const ALL_BUDGETS_STORAGE_KEY = "allBudgets";
export const ACCOUNTS_STORAGE_KEY = "accounts";
export const CATEGORIES_STORAGE_KEY = "categories";
export const FREQ_TRANSACTIONS_STORAGE_KEY = "frequentTransactions";

/**
 * Generates a random string of hex characters of given size
 * https://stackoverflow.com/a/58326357/9009483
 *
 * @param {number} size Desired size
 */
export const generateId = (size) =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");

/**
 * Return a number in a milliunit format
 * https://api.youneedabudget.com/#formats
 *
 * @param {number} num
 */
export const convertNumberToMilliUnits = (num) => {
  return (num * 1000).toString().replace(/([^-0-9])/, "");
};

/**
 * Helper for adding versioned data to local storage
 *
 * @param {string} key Storage key
 * @param {object} data Data to save
 * @param {number} version Version of data
 */
export function addToLocalStorage(key, data, version) {
  localStorage.setItem(
    `${key}_${version}`,
    JSON.stringify({ data: data, timestamp: new Date() })
  );
}

/**
 * Helper for retrieving versioned data from local storage
 *
 * @param {string} key Storage key
 * @param {number} version Version of data
 * @returns {object} Object of type `{data: {}, timestamp: string}`
 */
export function getFromLocalStorage(key, version) {
  return JSON.parse(localStorage.getItem(`${key}_${version}`));
}

/**
 * Returns relative time between t1 and t2.
 * Always returned negatitve regardless of whether `t1` or `t2` is larger.
 *
 * @param {Date} t1
 * @param {Date} t2
 * @returns {string} Relative time string
 */
export function getRelativeTime(t1, t2) {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  let unit;

  let delta = Math.abs(Math.floor((t1.getTime() - t2.getTime()) / 1000));

  if (delta < 60) {
    unit = "second";
  } else if (delta < 3600) {
    unit = "minute";
    delta = Math.floor(delta / 60);
  } else if (delta < 86_400) {
    unit = "hour";
    delta = Math.floor(delta / 3600);
  } else if (delta < 604_800) {
    unit = "day";
    delta = Math.floor(delta / 86_400);
  } else {
    unit = "week";
    delta = Math.floor(delta / 604_800);
  }

  // @ts-ignore
  return rtf.format(-delta, unit);
}
