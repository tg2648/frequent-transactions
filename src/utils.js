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
 * Returns relative time between t1 and t2.
 *
 * @param {Date} t1
 * @param {Date} t2
 * @returns {string} Relative time string
 */
export function getRelativeTime(t1, t2) {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  let unit;

  let delta = Math.max(Math.floor((t1.getTime() - t2.getTime()) / 1000), 0);

  if (delta < 3600) {
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
