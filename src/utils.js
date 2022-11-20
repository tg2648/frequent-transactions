/**
 * Constants and helper functions for working with data
 */

export const DATA_VERSION = 1;

export const SELECTED_BUDGET_STORAGE_KEY = "selectedBudget";
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
