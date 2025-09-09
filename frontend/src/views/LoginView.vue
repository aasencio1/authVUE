<template>
  <div class="login-container">
    <div class="stack">
      <h1>Login para Desarrollo Devops!</h1>
      <a href="http://localhost:4000/auth/google" class="google-btn">
        <img src="/google-login.png" alt="Login with Google" />
      </a>
    </div>
  </div>
</template>

<script setup>
// sin lógica por ahora
</script>

<style scoped>
/* Contenedor a pantalla completa y centrado */
.login-container {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;  /* centra el bloque .stack */
  text-align: center;
}

/* Bloque interno apilado en columna */
.stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;            /* espacio entre título y botón */
}

/* Botón (imagen) */
.google-btn img {
  cursor: pointer;
  width: 250px;
  transition: transform .2s ease;
}
.google-btn img:hover { transform: scale(1.05); }
</style>
