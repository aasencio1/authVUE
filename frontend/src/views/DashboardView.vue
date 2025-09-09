<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/api';

const user = ref<any>(null);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const { data } = await api.get('/auth/me');
    user.value = data.user ?? data;
  } catch (e) {
    error.value = 'No autenticado. Inicia sesión.';
  }
});

const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};
</script>

<template>
  <div class="layout">
    <main class="content">
      <!-- Aquí iría el contenido principal de tu app (si luego lo necesitas) -->
    </main>

    <aside class="sidebar">
      <div class="card">
        <h2>Dashboard</h2>

        <div v-if="error" class="muted">{{ error }}</div>

        <template v-else-if="user">
          <img
            v-if="user.photo || user.picture"
            :src="user.photo || user.picture"
            alt="Foto de perfil"
            class="avatar"
            referrerpolicy="no-referrer"
            @error="($event.target as HTMLImageElement).style.display='none'"
          />
          <div class="name">{{ user.name }}</div>
          <div class="email">{{ user.email }}</div>

          <button class="logout" @click="logout">Cerrar sesión</button>
        </template>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.layout {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 340px; /* contenido | sidebar derecha */
  background: #f6f7fb;
}
.content { padding: 24px; }
.sidebar {
  background: transparent;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
}
.card {
  background: #fff;
  width: 100%;
  max-width: 340px;
  padding: 24px;
  border-left: 1px solid #e9ebf0;
  box-shadow: -6px 0 24px rgba(0,0,0,.05);
}
h2 { margin: 0 0 16px; }
.avatar {
  width: 76px; height: 76px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  margin-bottom: 12px;
}
.name { font-weight: 700; margin-bottom: 4px; }
.email { color: #60646c; margin-bottom: 16px; word-break: break-all; }
.muted { color: #8a8f98; }
.logout {
  margin-top: 8px;
  background: #f0f2f7;
  border: 0;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
}
</style>
