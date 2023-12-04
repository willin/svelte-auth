<script>
	import { goto } from '$app/navigation';

	let { data } = $props();

	$effect(() => {
		if (data.user && data.user.invalid) {
			goto('/');
		}
	});
</script>

{#await data}
	<pre>{JSON.stringify(data)}</pre>
{/await}
