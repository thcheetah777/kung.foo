<script lang="ts">
    import UserLink from "$lib/components/UserLink.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<svelte:head>
  <title>@{data.username}</title>
  <meta name="description" content={data.bio} />
</svelte:head>

<main class="prose text-center mx-auto mt-8">
  <h1 class="text-5xl text-primary mb-8">
    @{data.username}
  </h1>

  <img
    src={data.photoURL ?? "/user.png"}
    alt="photoURL"
    width="256"
    class="mx-auto"
  />

  <p class="text-xl my-8">{data.bio ?? "no bio yet..."}</p>
  {#if data.links?.length}
    <ul class="list-none">
      {#each data.links as item}
        <li>
          <UserLink {...item} />
        </li>
      {/each}
    </ul>
  {:else}
    <p class="text-center my-12 text-lg font-bold">No items</p>
  {/if}
</main>
