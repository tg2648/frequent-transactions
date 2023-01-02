<script>
  import { onMount, setContext } from "svelte";
  import { Button, Icon, Offcanvas } from "sveltestrap";
  import * as ynab from "ynab";

  // Local imports
  import { redirectToOAuth, findTokenData } from "./auth";
  import { apiError, apiErrorType } from "./stores";
  import Budgets from "./lib/Budgets.svelte";
  import Footer from "./lib/Footer.svelte";
  import ApiError from "./lib/ApiError.svelte";
  import GithubLink from "./lib/GithubLink.svelte";
  import screenshot from "./assets/screenshot_1.png";

  let promise;

  let offcanvasOpen = false;
  const offcanvasToggle = () => (offcanvasOpen = !offcanvasOpen);

  onMount(() => {
    console.log("App onMount()");
    promise = findTokenData();
  });

  function logout() {
    apiError.set(null);
    sessionStorage.clear();
    localStorage.clear();
    promise = findTokenData();
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css"
  />
</svelte:head>

<main class="container py-4 px-3 mx-auto">
  {#await promise}
    <p>Loading...</p>
  {:then token}
    {#if token}
      <nav class="navbar navbar-expand-lg bg-light mb-2">
        <div class="container-fluid">
          <span class="navbar-brand mb-0 h1">Frequent Transactions</span>
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

      {#if $apiError}
        <ApiError error={$apiError} type={$apiErrorType} />
      {/if}

      <Budgets />

      <Offcanvas
        isOpen={offcanvasOpen}
        toggle={offcanvasToggle}
        placement="end"
      >
        <div class="d-grid gap-2">
          <Button color={"warning"} on:click={logout}>Logout</Button>
          <div>
            All data saved in your browser will be cleared after logging out.
          </div>
          <hr class="mb-1" />
          <div class="d-flex justify-content-center fs-4">
            <GithubLink />
          </div>
        </div>
      </Offcanvas>
    {:else}
      <h1 class="display-3">
        Frequent Transactions for <span class="header">YNAB</span>
      </h1>

      <p class="fs-4 mt-4 mb-5">
        Have non-recurrent transactions that occur often? Log them quickly in
        YNAB using this tool.
      </p>

      <img
        src={screenshot}
        class="img-fluid shadow bg-body rounded p-3"
        alt="Screenshot"
      />

      <div class="mt-5 mb-4 d-flex justify-content-center">
        <Button color={"primary"} on:click={() => redirectToOAuth()}>
          Authorize with YNAB
        </Button>
      </div>

      <p>
        Please note that this tool works directly in your browser, so it is
        currently not possible to synchronize frequent transactions across
        multiple devices.
      </p>

      <Footer />
    {/if}
  {/await}
</main>

<style>
  .header {
    font-family: "Sense", Helvetica, Arial, sans-serif;
    color: var(--ynabBlue);
    font-weight: 900;
  }
</style>
