<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { loadResult } from '../elegibilidad'

const route = useRoute()
const id = route.params.id as string
const result = ref(null as any)

onMounted(() => {
  // Leer parámetro dinámico desde la URL
  const stored = loadResult()
  result.value = stored
})
</script>

<template>
  <div class="page">
    <h1>Detalle — ID: {{ id }}</h1>
    <div v-if="result">
      <p><strong>Evaluado:</strong> {{ result.evaluatedAt }}</p>
      <p><strong>Resumen:</strong> {{ result.summary }}</p>
      <pre>{{ result }}</pre>
    </div>
    <div v-else>
      <p>No se encontró resultado guardado.</p>
    </div>
  </div>
</template>

<style scoped>
.page { padding: 12px }
</style>
