<script setup lang="ts">
</script>

<template>
  <div>
    <Suspense>
      <router-view />
      <template #fallback>
        <div style="padding: 20px; text-align: center;">Cargando...</div>
      </template>
    </Suspense>
  </div>
</template>

<style>
</style>
