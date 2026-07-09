<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../services/supabase'

type Beca = {
  id: number
  nombre: string
  descripcion: string
  requisito_promedio: number
  requisito_ingresos: number
  activa: boolean
}

const becas = ref<Beca[]>([])
const cargando = ref(true)
const error = ref('')

const input = ref({
  nombres: 'Estudiante',
  apellidos: 'ULEAM',
  correo: localStorage.getItem('usuario') || '',
  carrera: 'Software',
  semestre: 4,
  promedio: 8.5,
  ingreso: 400,
  cargaFamiliar: 4
})

const ingresoPorPersona = computed(() => {
  return input.value.cargaFamiliar > 0
    ? input.value.ingreso / input.value.cargaFamiliar
    : 0
})

const becasElegibles = computed(() => {
  return becas.value.filter((beca) => {
    return (
      input.value.promedio >= Number(beca.requisito_promedio) &&
      input.value.ingreso <= Number(beca.requisito_ingresos)
    )
  })
})

const evaluado = ref(false)

onMounted(async () => {
  const { data, error } = await supabase
    .from('becas')
    .select('*')
    .eq('activa', true);

  console.log('DATA:', data);
  console.log('ERROR:', error);

  if (error) {
    error.value = error.message;
    return;
  }

  becas.value = data || [];
  cargando.value = false;
});

function evaluar() {
  evaluado.value = true

  const datos = {
    nombres: input.value.nombres,
    apellidos: input.value.apellidos,
    nombreCompleto: `${input.value.nombres} ${input.value.apellidos}`.trim(),
    correo: input.value.correo,
    carrera: input.value.carrera,
    semestre: input.value.semestre,
    promedio: input.value.promedio,
    ingreso: input.value.ingreso,
    cargaFamiliar: input.value.cargaFamiliar,
    ingresoPorPersona: ingresoPorPersona.value,
    becasElegibles: becasElegibles.value.map((beca) => ({
      id: beca.id,
      nombre: beca.nombre,
      descripcion: beca.descripcion,
      requisito_promedio: beca.requisito_promedio,
      requisito_ingresos: beca.requisito_ingresos,
      activa: beca.activa
    }))
  }

  localStorage.setItem('becas_datos_estudiante', JSON.stringify(datos))
  localStorage.setItem('becas_nombre', datos.nombreCompleto)
  localStorage.setItem('becas_email', datos.correo)

  window.parent?.postMessage(
    {
      tipo: 'BECAS_DATOS_ESTUDIANTE',
      datos
    },
    '*'
  )
}

function iniciarPostulacion() {
  evaluar()
  window.parent?.postMessage({ modulo: 'postulacion' }, '*')
}
</script>

<template>
  <div class="page">
    <header class="brand-header">
      <img src="/ULEAM.png" alt="Logo ULEAM" class="brand-logo" />
      <div>
        <p class="university-name">ULEAM</p>
        <h1>Verificador de elegibilidad</h1>
        <p>Consulta las becas disponibles y verifica si el estudiante cumple los requisitos.</p>
      </div>
    </header>

    <main class="layout">
      <section class="card">
        <h2>Datos del estudiante</h2>

        <form @submit.prevent="evaluar" class="form">
          <label>
            Nombres
            <input v-model="input.nombres" />
          </label>

          <label>
            Apellidos
            <input v-model="input.apellidos" />
          </label>

          <label>
            Correo institucional
            <input v-model="input.correo" type="email" />
          </label>

          <label>
            Carrera
            <input v-model="input.carrera" />
          </label>

          <label>
            Semestre
            <input v-model.number="input.semestre" type="number" min="1" max="10" />
          </label>

          <label>
            Promedio
            <input v-model.number="input.promedio" type="number" min="0" max="10" step="0.1" />
          </label>

          <label>
            Ingreso familiar mensual
            <input v-model.number="input.ingreso" type="number" min="0" />
          </label>

          <label>
            Carga familiar
            <input v-model.number="input.cargaFamiliar" type="number" min="1" />
          </label>

          <div class="info-box">
            <strong>Ingreso por integrante:</strong>
            ${{ ingresoPorPersona.toFixed(2) }}
          </div>

          <button type="submit">Evaluar elegibilidad</button>
        </form>
      </section>

      <section class="card">
        <h2>Becas disponibles</h2>

        <p v-if="cargando">Cargando becas desde Supabase...</p>
        <p v-if="error" class="error">{{ error }}</p>

        <div v-if="!cargando && becas.length === 0" class="empty">
          No hay becas activas registradas.
        </div>

        <div class="becas-list">
          <article v-for="beca in becas" :key="beca.id" class="beca-card">
            <h3>{{ beca.nombre }}</h3>
            <p>{{ beca.descripcion }}</p>
            <p>Promedio mínimo: <strong>{{ beca.requisito_promedio }}</strong></p>
            <p>Ingreso máximo: <strong>${{ Number(beca.requisito_ingresos).toLocaleString() }}</strong></p>
          </article>
        </div>
      </section>

      <section class="card result-card">
        <h2>Resultado</h2>

        <div v-if="!evaluado" class="empty">
          Completa los datos y presiona “Evaluar elegibilidad”.
        </div>

        <div v-else-if="becasElegibles.length > 0" class="success">
          <h3>Estudiante elegible</h3>
          <p>El estudiante cumple los requisitos para:</p>

          <ul>
            <li v-for="beca in becasElegibles" :key="beca.id">
              {{ beca.nombre }}
            </li>
          </ul>

          <button @click="iniciarPostulacion">Iniciar postulación →</button>
        </div>

        <div v-else class="failure">
          <h3>No elegible</h3>
          <p>Actualmente no cumple los requisitos de las becas activas.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.page {
  padding: 16px;
  background: #f4f7f5;
  min-height: 100vh;
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  border: 1px solid #d8e7de;
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 18px;
}

.brand-logo {
  width: 70px;
  height: 70px;
  object-fit: contain;
}

.university-name {
  margin: 0;
  font-weight: 800;
  color: #005f3e;
}

h1,
h2,
h3 {
  margin-top: 0;
}

.layout {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 18px;
  align-items: start;
}

.card {
  background: white;
  border: 1px solid #d8e7de;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.result-card {
  grid-column: 1 / -1;
}

.form {
  display: grid;
  grid-template-columns: repeat(2, minmax(180px, 1fr));
  gap: 14px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 700;
}

input {
  padding: 11px;
  border: 1px solid #cfded5;
  border-radius: 10px;
}

button {
  border: 0;
  border-radius: 12px;
  padding: 12px 18px;
  background: #005f3e;
  color: white;
  font-weight: 800;
  cursor: pointer;
}

.form button,
.info-box {
  grid-column: 1 / -1;
}

.info-box {
  background: #eef7f1;
  border: 1px solid #cfe7d6;
  border-radius: 12px;
  padding: 12px;
}

.becas-list {
  display: grid;
  gap: 12px;
}

.beca-card {
  border: 1px solid #e0e9e3;
  border-radius: 12px;
  padding: 14px;
  background: #fbfdfc;
}

.success {
  background: #e8f5e9;
  border-left: 5px solid #0a6b35;
  border-radius: 12px;
  padding: 16px;
}

.failure {
  background: #fdeaea;
  border-left: 5px solid #9b1c1c;
  border-radius: 12px;
  padding: 16px;
}

.empty {
  color: #60756b;
  background: #f7faf8;
  border-radius: 12px;
  padding: 14px;
}

.error {
  color: #9b1c1c;
  background: #fdeaea;
  padding: 10px;
  border-radius: 10px;
}

@media (max-width: 850px) {
  .layout,
  .form {
    grid-template-columns: 1fr;
  }

  .brand-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>