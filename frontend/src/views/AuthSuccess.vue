<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
onMounted(() => {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const token = params.get('token');
  if (token) { localStorage.setItem('token', token); router.replace('/dashboard'); }
  else { router.replace('/login'); }
});
</script>

<template><p style="padding:24px">Procesando inicio de sesión…</p></template>
