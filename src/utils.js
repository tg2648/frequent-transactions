import { SaveTransaction } from "ynab";
import { config } from "./config";

export let ynabFlagColors = {
  [SaveTransaction.FlagColorEnum.Red]: "#ff453a",
  [SaveTransaction.FlagColorEnum.Orange]: "#ff9f0a",
  [SaveTransaction.FlagColorEnum.Yellow]: "#ffd60a",
  [SaveTransaction.FlagColorEnum.Green]: "#32d74b",
  [SaveTransaction.FlagColorEnum.Blue]: "#64d2ff",
  [SaveTransaction.FlagColorEnum.Purple]: "#bf5af2",
};

export function authorizeWithYNAB() {
  const uri = `https://app.youneedabudget.com/oauth/authorize?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=token`;
  location.replace(uri);
}

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

/**
 * Create a Base64-encoded string from a Unicode string
 * https://developer.mozilla.org/en-US/docs/Glossary/Base64#solution_1_%E2%80%93_escaping_the_string_before_encoding_it
 */
export function b64EncodeUnicode(str) {
  return window.btoa(encodeURIComponent(str));
}

/**
 * Decode a Base64-encoded Unicode string
 * https://developer.mozilla.org/en-US/docs/Glossary/Base64#solution_1_%E2%80%93_escaping_the_string_before_encoding_it
 */
export function UnicodeDecodeB64(str) {
  return decodeURIComponent(window.atob(str));
}
