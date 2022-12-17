<script>
  import { onMount, setContext } from "svelte";
  import { Button, Icon, Offcanvas } from "sveltestrap";
  import * as ynab from "ynab";

  // Local imports
  import { config } from "./config";
  import { apiError } from "./stores";
  import Budgets from "./lib/Budgets.svelte";
  import Footer from "./lib/Footer.svelte";
  import ApiError from "./lib/ApiError.svelte";

  /** @type { ynab.api } */
  let ynabApi = null;
  let token = null;

  let offcanvasOpen = false;
  const offcanvasToggle = () => (offcanvasOpen = !offcanvasOpen);

  // Make YNAB api available to other components
  setContext(config.context_key, {
    getApi: () => ynabApi,
  });

  onMount(() => {
    console.log("App onMount()");
    token = findYNABToken();
    if (token) {
      ynabApi = new ynab.api(token);
    }
  });

  function authorizeWithYNAB() {
    const uri = `https://app.youneedabudget.com/oauth/authorize?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=token`;
    location.replace(uri);
  }

  function findYNABToken() {
    let token = null;
    const search = window.location.hash
      .substring(1)
      .replace(/&/g, '","')
      .replace(/=/g, '":"');

    if (search && search !== "") {
      // Try to get access_token from the hash returned by OAuth
      const params = JSON.parse('{"' + search + '"}', function (key, value) {
        return key === "" ? value : decodeURIComponent(value);
      });

      token = params.access_token;
      sessionStorage.setItem("ynab_access_token", token);
      window.location.hash = "";
    } else {
      // Otherwise try sessionStorage
      token = sessionStorage.getItem("ynab_access_token");
    }

    return token;
  }

  function logout() {
    token = null;
    apiError.set(null);
    sessionStorage.clear();
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css"
  />
</svelte:head>

<main class="container py-4 px-3 mx-auto">
  {#if $apiError}
    <ApiError error={$apiError} />
  {/if}

  {#if token}
    <nav class="navbar navbar-expand-lg bg-light mb-2">
      <div class="container-fluid">
        <span class="navbar-brand mb-0 h1">Frequent Transactions for YNAB</span>
        <div class="ms-auto me-2">
          <Button
            outline
            class="border-0 fs-2"
            style="--bs-btn-padding-y: 0rem;"
            on:click={offcanvasToggle}
          >
            <Icon name="list" />
          </Button>
        </div>
      </div>
    </nav>

    <Budgets />

    <Offcanvas isOpen={offcanvasOpen} toggle={offcanvasToggle} placement="end">
      <div class="d-grid gap-2">
        <Button color={"warning"} on:click={logout}>Logout</Button>
        <hr class="mb-1" />
        <div class="d-flex justify-content-center fs-4">
          <a
            href="https://github.com/tg2648/frequent-transactions"
            rel="noreferrer"
            target="_blank"><Icon name="github" style="color: black;" /></a
          >
        </div>
      </div>
    </Offcanvas>
  {:else}
    <Button color={"primary"} on:click={authorizeWithYNAB}>
      Authorize with YNAB
    </Button>
    <Footer />
  {/if}
</main>
