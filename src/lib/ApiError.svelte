<script>
  import { Icon, Button } from "sveltestrap";
  import { authorizeWithYNAB } from "../utils";

  export let error;
  export let type;
</script>

<div class="alert alert-danger d-flex align-items-center" role="alert">
  <Icon name="exclamation-triangle-fill" class="me-2" />
  <div>
    <strong>YNAB Error:</strong>
    <span>{error}</span>
    {#if type === "unauthorized"}
      <div>
        <Button
          color="link"
          class="p-0 alert-link"
          on:click={authorizeWithYNAB}
        >
          Login
        </Button>
      </div>
    {/if}
  </div>
</div>
