<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { loadLimits, validateInput, evaluateElegibility, loadResult, saveResult } from '../elegibilidad'
import type { EligibilityInput, ValidationErrors } from '../elegibilidad'
import { useRouter } from 'vue-router'

const router = useRouter()
const limits = ref(await loadLimits())

const input = ref<EligibilityInput>({
  nombres: 'María Fernanda',
  apellidos: 'Zambrano Vera',
  cedula: '1312345678',
  correo: 'maria.zambrano@uleam.edu.ec',
  telefono: '0991234567',
  carrera: 'Software',
  semestre: 4,
  promedio: 8.0,
  ingreso: 400,
  cargaFamiliar: 4,
  quintil: 2,
  materiasAprobadas: 5,
  discapacidad: false,
  padreNombre: 'José Zambrano',
  padreOcupacion: 'Pescador',
  madreNombre: 'Rosa Vera',
  madreOcupacion: 'Comerciante',
  hermanos: 2,
  hermanosEstudian: 1,
  viveCon: 'Padres',
  vivienda: 'Alquilada'
})
const errors = ref<ValidationErrors>({})
const lastResult = ref(loadResult())
const formularioEvaluado = ref(false)

function aplicarDatosExternos(datos: any, sesion?: any) {
  if (!datos && !sesion) return
  const nombreCompleto = datos?.nombreCompleto || sesion?.nombre || ''
  const partes = nombreCompleto.split(' ')
  input.value = {
    ...input.value,
    nombres: datos?.nombres || partes.slice(0, 2).join(' ') || input.value.nombres,
    apellidos: datos?.apellidos || partes.slice(2).join(' ') || input.value.apellidos,
    cedula: datos?.cedula || input.value.cedula,
    correo: datos?.correo || sesion?.correo || input.value.correo,
    telefono: datos?.telefono || input.value.telefono,
    carrera: datos?.carrera || input.value.carrera,
    semestre: Number(datos?.semestre || input.value.semestre),
    promedio: Number(datos?.promedio || input.value.promedio),
    ingreso: Number(datos?.ingreso || input.value.ingreso),
    cargaFamiliar: Number(datos?.cargaFamiliar || input.value.cargaFamiliar),
    quintil: Number(datos?.quintil || input.value.quintil),
    padreNombre: datos?.padreNombre || input.value.padreNombre,
    madreNombre: datos?.madreNombre || input.value.madreNombre,
    hermanos: Number(datos?.hermanos ?? input.value.hermanos),
    vivienda: datos?.vivienda || input.value.vivienda
  }
}

onMounted(() => {
  window.addEventListener('message', (event) => {
    if (event.data?.tipo === 'BECAS_PORTAL_STATE') aplicarDatosExternos(event.data.datos, event.data.session)
  })
})

const promedioCalificado = computed(() => Math.min(10, input.value.promedio + (input.value.materiasAprobadas * 0.05)))
const ingresoPorPersona = computed(() => input.value.cargaFamiliar > 0 ? input.value.ingreso / input.value.cargaFamiliar : 0)

function guardarDatosParaPostulacion() {
  const datos = {
    nombres: input.value.nombres,
    apellidos: input.value.apellidos,
    nombreCompleto: `${input.value.nombres} ${input.value.apellidos}`.trim(),
    cedula: input.value.cedula,
    correo: input.value.correo,
    telefono: input.value.telefono,
    carrera: input.value.carrera,
    semestre: input.value.semestre,
    promedio: input.value.promedio,
    ingreso: input.value.ingreso,
    cargaFamiliar: input.value.cargaFamiliar,
    quintil: input.value.quintil,
    padreNombre: input.value.padreNombre,
    madreNombre: input.value.madreNombre,
    hermanos: input.value.hermanos,
    vivienda: input.value.vivienda
  }
  localStorage.setItem('becas_datos_estudiante', JSON.stringify(datos))
  localStorage.setItem('becas_nombre', datos.nombreCompleto)
  localStorage.setItem('becas_email', datos.correo)
  window.parent?.postMessage({ tipo: 'BECAS_DATOS_ESTUDIANTE', datos }, '*')
}

function onSubmit() {
  const v = validateInput(input.value)
  errors.value = v.errors
  formularioEvaluado.value = true
  if (!v.isValid) return

  guardarDatosParaPostulacion()
  const res = evaluateElegibility(input.value, limits.value)
  saveResult(res)
  lastResult.value = res
}

function goToDetail(id: string) {
  router.push({ name: 'detalle', params: { id } })
}

function iniciarPostulacion() {
  guardarDatosParaPostulacion()
  // Dentro del portal único se cambia al módulo React mediante postMessage.
  window.parent?.postMessage({ modulo: 'postulacion' }, '*')
  // Si se abre el módulo Vue solo, este fallback abre React directamente.
  setTimeout(() => {
    if (window.self === window.top) window.location.href = 'http://localhost:5174/documentos'
  }, 80)
}

function resetForm() {
  input.value = {
    nombres: '', apellidos: '', cedula: '', correo: '', telefono: '', carrera: 'Software', semestre: 1,
    promedio: 8.0, ingreso: 400, cargaFamiliar: 3, quintil: 2, materiasAprobadas: 4, discapacidad: false,
    padreNombre: '', padreOcupacion: '', madreNombre: '', madreOcupacion: '', hermanos: 0, hermanosEstudian: 0,
    viveCon: 'Padres', vivienda: 'Propia'
  }
  errors.value = {}
  lastResult.value = null
  formularioEvaluado.value = false
}

function getEligibleScholarships() {
  if (!lastResult.value) return []
  return limits.value.becas.filter((beca) => (
    lastResult.value!.input.promedio >= beca.promedioMin &&
    lastResult.value!.input.ingreso <= beca.ingresoMax &&
    lastResult.value!.input.quintil <= beca.quintilMax
  ))
}
</script>

<template>
  <div class="page">
    <header class="brand-header">
      <img src="/ULEAM.png" alt="Logo ULEAM" class="brand-logo" />
      <div>
        <p class="university-name">ULEAM</p>
        <h1>Verificador de elegibilidad</h1>
      </div>
    </header>

    <section class="form-section">
      <section>
        <h2>Formulario de datos personales y familiares</h2>
        <form @submit.prevent="onSubmit" class="large-form">
          <fieldset>
            <legend>Datos del estudiante</legend>
            <label>Nombres <input v-model="input.nombres" /></label>
            <label>Apellidos <input v-model="input.apellidos" /></label>
            <label>Cédula <input v-model="input.cedula" maxlength="10" /></label>
            <label>Correo institucional <input type="email" v-model="input.correo" /></label>
            <label>Teléfono <input v-model="input.telefono" /></label>
            <label>Carrera <input v-model="input.carrera" /></label>
            <label>Semestre <input type="number" min="1" max="10" v-model.number="input.semestre" /></label>
          </fieldset>

          <fieldset>
            <legend>Información académica y socioeconómica</legend>
            <label>Promedio <input type="number" step="0.1" min="0" max="10" v-model.number="input.promedio" /></label>
            <div v-if="errors.promedio" class="error">{{ errors.promedio }}</div>
            <label>Ingreso familiar mensual <input type="number" v-model.number="input.ingreso" /></label>
            <div v-if="errors.ingreso" class="error">{{ errors.ingreso }}</div>
            <label>Carga familiar <input type="number" v-model.number="input.cargaFamiliar" /></label>
            <label>Quintil socioeconómico <input type="number" v-model.number="input.quintil" min="1" max="6" /></label>
            <label>Materias aprobadas <input type="number" v-model.number="input.materiasAprobadas" /></label>
            <label class="check"><input type="checkbox" v-model="input.discapacidad" /> Registra discapacidad</label>
          </fieldset>

          <fieldset>
            <legend>Datos familiares</legend>
            <label>Nombre del padre <input v-model="input.padreNombre" /></label>
            <label>Ocupación del padre <input v-model="input.padreOcupacion" /></label>
            <label>Nombre de la madre <input v-model="input.madreNombre" /></label>
            <label>Ocupación de la madre <input v-model="input.madreOcupacion" /></label>
            <label>Número de hermanos <input type="number" min="0" v-model.number="input.hermanos" /></label>
            <label>Hermanos que estudian <input type="number" min="0" v-model.number="input.hermanosEstudian" /></label>
            <label>Vive con <select v-model="input.viveCon"><option>Padres</option><option>Madre</option><option>Padre</option><option>Familiares</option><option>Solo/a</option></select></label>
            <label>Tipo de vivienda <select v-model="input.vivienda"><option>Propia</option><option>Alquilada</option><option>Prestada</option></select></label>
          </fieldset>

          <div class="derived-box">
            <p><strong>Promedio calculado:</strong> {{ promedioCalificado.toFixed(2) }}</p>
            <p><strong>Ingreso por integrante:</strong> ${{ ingresoPorPersona.toFixed(2) }}</p>
          </div>

          <button type="submit">Evaluar elegibilidad</button>
        </form>
      </section>

      <section class="result-section">
        <div v-if="lastResult" class="result-card" :class="lastResult.eligible ? 'success' : 'failure'">
          <span class="result-badge" :class="lastResult.eligible ? 'success-badge' : 'failure-badge'">
            {{ lastResult.eligible ? 'Elegible' : 'No elegible' }}
          </span>
          <p class="result-summary">{{ lastResult.summary }}</p>

          <div v-if="lastResult.eligible" class="scholarships-list">
            <div v-for="scholarship in getEligibleScholarships()" :key="scholarship.tipo" class="scholarship-card">
              {{ scholarship.tipo }}
            </div>
            <button class="btn-primary" @click="iniciarPostulacion">Iniciar postulación →</button>
          </div>

          <div v-else>
            <p><strong>Motivos:</strong></p>
            <ul><li v-for="reason in lastResult.reasons" :key="reason">{{ reason }}</li></ul>
            <p class="notice">Puedes llenar todos tus datos y evaluar aunque tu promedio sea menor. El sistema solo muestra que no cumples el requisito.</p>
          </div>

          <div class="result-actions">
            <button class="btn-secondary" @click="resetForm">Nueva verificación</button>
            <button class="btn-primary" @click="goToDetail(lastResult.input.promedio.toString())">Ver detalle</button>
          </div>
        </div>

        <div v-else class="empty-result">
          <p>Aún no has realizado una verificación.</p>
        </div>

        <section class="rules-section">
          <h2>Requisitos de las becas</h2>
          <div class="rule-list">
            <div v-for="rule in limits.becas" :key="rule.tipo" class="rule-card">
              <h3>{{ rule.tipo }}</h3>
              <p>Promedio mínimo: <strong>{{ rule.promedioMin }}</strong></p>
              <p>Ingresos máximos: <strong>${{ rule.ingresoMax.toLocaleString() }}</strong></p>
              <p>Quintil máximo: <strong>{{ rule.quintilMax }}</strong></p>
            </div>
          </div>
        </section>
      </section>
    </section>
  </div>
</template>

<style scoped>
.error { color: #b00020; margin: 4px 0 8px; font-size: 13px; }
.page { padding: 12px; }
.large-form fieldset { border: 1px solid #d8e7de; border-radius: 14px; padding: 14px; margin-bottom: 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.large-form legend { font-weight: 800; color: #005f3e; padding: 0 8px; }
.large-form label { display: flex; flex-direction: column; gap: 6px; font-weight: 700; }
.large-form input, .large-form select { padding: 10px; border: 1px solid #cfded5; border-radius: 10px; }
.large-form .check { flex-direction: row; align-items: center; }
.derived-box { background: #eef7f1; border: 1px solid #cfe7d6; padding: 12px; border-radius: 12px; margin-bottom: 12px; }
.form-section { display: grid; grid-template-columns: 1.2fr .8fr; gap: 20px; align-items: start; }
.result-card, .empty-result, .rules-section { background: white; border: 1px solid #d8e7de; border-radius: 14px; padding: 18px; margin-bottom: 16px; }
.result-badge { display: inline-block; padding: 8px 12px; border-radius: 999px; font-weight: 800; }
.success-badge { background: #dff5e7; color: #0a6b35; }
.failure-badge { background: #fde4e4; color: #9b1c1c; }
.result-summary { font-size: 1.05rem; }
.scholarships-list { display: grid; gap: 12px; margin: 15px 0; }
.scholarship-card { padding: 14px; background-color: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 10px; font-weight: 800; color: #1b5e20; }
.result-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
.btn-primary, .btn-secondary, form button { padding: 11px 22px; border: none; border-radius: 22px; cursor: pointer; font-weight: 800; }
.btn-primary, form button { background-color: #005f3e; color: white; }
.btn-secondary { background: white; color: #005f3e; border: 2px solid #005f3e; }
.notice { background: #fff7e6; border-left: 4px solid #f5a623; padding: 10px; }
.rule-list { display: grid; gap: 10px; }
.rule-card { border: 1px solid #e0e9e3; border-radius: 12px; padding: 12px; }
@media (max-width: 850px) { .form-section { grid-template-columns: 1fr; } }
</style>
