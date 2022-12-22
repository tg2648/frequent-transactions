<script>
  export let label;
  export let id;
  export let error = null;
  export let cls = "";
</script>

<div class={cls}>
  <div class="input-group" class:has-validation={error}>
    <div class="form-floating" class:is-invalid={error}>
      <slot name="input" />
      <label for={id}>{label}</label>
    </div>
    <slot name="right-addon" />
    {#if error}
      <div class="invalid-feedback">{error}</div>
    {/if}
  </div>
  <slot name="text" />
</div>
