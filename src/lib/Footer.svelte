<script>
  import GithubLink from "./GithubLink.svelte";
</script>

<section>
  <h3 id="privacy" class="mt-4">Privacy Policy</h3>
  <p>
    Frequent Transactions for YNAB does not collect any personal information and
    does not store any information from you or your YNAB account. All data
    retrieved from YNAB is stored only in your browser and is never transmitted
    to any other location or third-party.
  </p>
  <p>
    The following data is retrieved and saved by the browser to avoid repeatedly
    asking for it from YNAB: category names/IDs, account names/IDs, and budget
    names/IDs/currency formats. This data is then erased from your browser on
    logout.
  </p>
  <div class="d-flex justify-content-center fs-4 mt-5">
    <GithubLink />
  </div>
</section>
