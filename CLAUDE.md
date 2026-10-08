# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Frequent Transactions for YNAB: a Svelte 3 + Vite single-page app, deployed on Netlify, that lets users save "frequent" (non-recurring but common) transactions and log them to YNAB with one click. UI uses Bootstrap 5 via `sveltestrap`; YNAB calls go through the official `ynab` JS SDK directly from the browser.

## Commands

- `npm run dev` — Vite dev server on :5173 (frontend only; the OAuth functions are not served, so login will not work)
- `netlify dev` — full local stack on :8888 (proxies Vite per `netlify.toml` and serves `netlify/functions/*`). Use this when touching auth. Requires `YNAB_CLIENT_ID` and `YNAB_CLIENT_SECRET` in the environment (e.g. a gitignored `.env`), and a YNAB OAuth app whose redirect URI is `http://localhost:8888/.netlify/functions/auth-callback`.
- `npm run build` / `npm run preview` — production build to `dist/` and preview it

There is no test suite, linter, or type-check script. `jsconfig.json` enables `checkJs`, so JSDoc types are checked by the editor (Svelte VS Code extension, which also formats on save).

## Architecture

### Auth flow (spans `netlify/functions/` and `src/auth.js`)

The YNAB client secret lives only in Netlify functions; the browser never sees it.

1. `redirectToOAuth()` stores a random nonce in `sessionStorage` and sends the browser to `/.netlify/functions/auth?nonce=<nonce>`. That function generates a random `state`, stores `state.nonce` in an HttpOnly cookie scoped to the callback path, and redirects to YNAB's authorize page.
2. YNAB redirects to `auth-callback`, which verifies `state` against the cookie, exchanges the code, and redirects to the fixed app URL (`${URL}/`, never a client-supplied URL) with `access_token`, `refresh_token`, `expires_at`, `nonce` in the **URL hash**. Failures redirect with `#error=<code>` instead.
3. `findTokenData()` (called in `App.svelte` on mount) strips the hash and saves the token only if the hash `nonce` matches the one in `sessionStorage`; otherwise it falls back to the stored token. Because the return URL is fixed, login from a deploy preview lands on the production site.

Helpers shared by the auth functions (`state` cookie, redirect URI, app URL) are in `netlify/functions/utils/session.js`. Security headers/CSP for the static site are in `public/_headers`; update `connect-src` etc. there if you add new external origins.
4. `auth-refresh` (POST with the token JSON) returns refreshed tokens.

The `simple-oauth2` client shared by the functions is in `netlify/functions/utils/oauth.js`; it throws at module load if the env vars are missing.

### State and persistence (`src/stores.js`)

All persistence is in `localStorage` via the `ynabData` object, which has `load`/`save`/`reset` per entity (budgets, selectedBudgetId, accounts, categories, freqTransactions, token). Key points:

- Entries are stored as `{data, timestamp}` under the key `` `${key}_${DATA_VERSION}` ``. If you change the shape of stored data, bump `DATA_VERSION`; older keys are then ignored.
- Accounts and categories are cached per budget (key includes `budgetId`). The cache is used until the user clicks a refresh link in the add form (`refreshHandlers` in `Budgets.svelte`).
- `ynabData.token.load()` is async and **auto-refreshes** the token if it expires within 5 minutes. Every YNAB API call calls it right before creating `new ynab.API(token.access_token)`; follow that pattern rather than caching the token.
- On refresh failure it sets the `apiErrorType` store to `"unauthorized"` and sets `apiError`. Callers check `$apiErrorType !== "unauthorized"` before calling the API. `ApiError.svelte` then shows a re-login link.
- Logout clears all of `localStorage`/`sessionStorage`.

### Components

`App.svelte` (login page or authed shell) → `Budgets.svelte` (owns fetching budgets/accounts/categories, the frequent-transactions list, and the add-transaction modal) → `FreqTransactions.svelte` (list, reorder/delete in edit mode) → `FreqTransaction.svelte` (single card; the "Log" button calls `createTransaction` with today's date).

A saved frequent transaction is a plain object built in `AddTransactionForm.svelte` plus `Budgets.addTransaction()`: `{id, budget: {id, name}, account: {id, name}, category: {id, name, group} | null, payeeName, amount, milliAmount, displayAmount, memo, flag, cleared, approved}`. `milliAmount` (YNAB milliunits, from `convertNumberToMilliUnits`) and `displayAmount` are computed once at creation, using the budget's currency.
