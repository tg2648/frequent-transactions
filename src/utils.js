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
