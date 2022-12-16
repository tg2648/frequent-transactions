<script>
  import { FormGroup } from "sveltestrap";

  export let label;
</script>

<div class="mb-2">
  <div class="input-group">
    <FormGroup floating style="margin-bottom: 0px!important;" {label}>
      <slot name="input" />
    </FormGroup>
    <slot name="right-addon" />
  </div>
  <slot name="text" />
</div>
