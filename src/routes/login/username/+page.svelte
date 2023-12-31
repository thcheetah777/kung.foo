<script lang="ts">
  import AuthCheck from '$lib/components/AuthCheck.svelte';
  import { db, user, userData } from "$lib/firebase";
  import { doc, getDoc, writeBatch } from "firebase/firestore";
  
  let username = "";
  let loading = false;
  let isAvailable = false;

  let debounceTimer: NodeJS.Timeout;

  const re = /^(?=[a-zA-Z0-9._]{3,16}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

  $: isValid = username?.length > 2 && username.length < 16 && re.test(username);
  $: isTouched = username.length > 0;
  $: isTaken = isValid && !isAvailable && !loading;
  
  async function checkAvailability() {
    isAvailable = false;
    loading = true;
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      console.log("Checking availability of @", username);
      
      const ref = doc(db, "usernames", username);
      const exists = await getDoc(ref).then(doc => doc.exists());
  
      isAvailable = !exists;
      loading = false;
    }, 500);
  }

  async function confirmUsername() {
    console.log("Confirming username", username);
    const batch = writeBatch(db);
    batch.set(doc(db, "usernames", username), { uid: $user?.uid });
    batch.set(doc(db, "users", $user!.uid), {
      username,
      photoURL: $user?.photoURL ?? null,
      published: true,
      bio: "I am the ",
      links: [
        {
          title: "Test Link",
          url: "https://example.com",
          icon: "tiktok"
        }
      ]
    });

    await batch.commit();
  }
</script>

<AuthCheck>
  {#if $userData?.username}
    <div class="mb-5">
      <p class="text-success">
        Your username is <span>@{$userData.username}</span>
      </p>
      <p>(Usernames cannot be changed)</p>
    </div>
    <a href="/login/photo" class="btn btn-primary">Upload Profile Image</a>
  {:else}    
    <form class="w-2/5" on:submit|preventDefault={confirmUsername}>
      <input
        type="text"
        placeholder="Username"
        class="input w-full"
        bind:value={username}
        on:input={checkAvailability}
        class:input-error={(!isValid && isTouched)}
        class:input-warning={isTaken}
        class:input-success={isAvailable && isValid && !loading}
      />

      <div class="my-4 min-h-16 px-8 w-full">
        {#if loading && isValid}
          <p class="text-secondary">Checking availablity of @{username}</p>
        {/if}

        {#if !isValid && isTouched}
          <p class="text-error text-sm">
            must be 3-16 characters long, alphanumeric only
          </p>
        {/if}

        {#if isValid && !isAvailable && !loading}
          <p class="text-warning text-sm">
            @{username} is not available
          </p>
        {/if}

        {#if isAvailable && isValid && !loading}
          <button class="btn btn-success">Continue with @{username}</button>
        {/if}
      </div>
    </form>
  {/if}
</AuthCheck>
