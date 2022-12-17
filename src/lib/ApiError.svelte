<script>
  import { Icon } from "sveltestrap";

  export let error;
</script>

<div class="alert alert-danger d-flex align-items-center" role="alert">
  <Icon name="exclamation-triangle-fill" class="me-2" />
  <div>
    <strong>YNAB Error:</strong>
    {error}
  </div>
</div>
