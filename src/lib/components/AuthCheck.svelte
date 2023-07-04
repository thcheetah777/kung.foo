<script>
  import { user } from "$lib/firebase";
  import "iconify-icon";
</script>

{#if $user}
  <slot />
{:else}
  <div>
    <p class="text-error">
      <iconify-icon icon="material-symbols:lock" />
      You must be logged in to view this page.
    </p>
    <br>
    <a class="btn btn-primary" href="/login">Sign In</a>
  </div>
{/if}
