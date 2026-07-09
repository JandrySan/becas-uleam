<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { EligibilityInput, EligibilityResult, LimitsData } from '../elegibilidad'
import {
  evaluateElegibility,
  loadLimits,
  loadResult,
  saveResult,
  validateInput,
} from '../elegibilidad'

const thresholds = ref<LimitsData | null>(null)
const result = ref<EligibilityResult | null>(null)
const loading = ref(true)
const submitted = ref(false)

const form = reactive({
  promedio: '',
  ingreso: '',
  cargaFamiliar: '',
  quintil: '1',
  materiasAprobadas: '',
})

const touched = reactive({
  promedio: false,
  ingreso: false,
  cargaFamiliar: false,
  quintil: false,
  materiasAprobadas: false,
})

function parseNumber(value: string | number | null) {
  if (value === null) return NaN

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : NaN
  }

  const normalized = value.trim()
  return normalized === '' ? NaN : Number(normalized)
}

const parsedInput = computed<EligibilityInput>(() => ({
  promedio: parseNumber(form.promedio),
  ingreso: parseNumber(form.ingreso),
  cargaFamiliar: parseNumber(form.cargaFamiliar),
  quintil: parseNumber(form.quintil),
  materiasAprobadas: parseNumber(form.materiasAprobadas),
}))

const validation = computed(() => validateInput(parsedInput.value))
const isFormValid = computed(() => validation.value.isValid)

function showError(field: keyof typeof touched) {
  return submitted.value || touched[field]
}

async function initialize() {
  thresholds.value = await loadLimits()
  const saved = loadResult()
  if (saved) {
    result.value = saved
    form.promedio = String(saved.input.promedio)
    form.ingreso = String(saved.input.ingreso)
    form.cargaFamiliar = String(saved.input.cargaFamiliar)
    form.quintil = String(saved.input.quintil)
    form.materiasAprobadas = String(saved.input.materiasAprobadas)
  }
  loading.value = false
}

async function verifyEligibility() {
  submitted.value = true
  if (!isFormValid.value || !thresholds.value) return
  const evaluated = evaluateElegibility(parsedInput.value, thresholds.value)
  result.value = evaluated
  saveResult(evaluated)
}

onMounted(initialize)
</script>

<template>
  <section id="center" class="eligibility-shell">
    <div class="intro-card">
      <div class="brand-header">
        <img src="/ULEAM.png" alt="Logo de la Universidad Laica Eloy Alfaro de Manabí" class="brand-logo" />
        <div>
          <p class="university-name">ULEAM</p>
          <h1>Verificador de elegibilidad</h1>
        </div>
      </div>
      <p>Ingresa tus datos y verifica si cumples con los criterios de la beca.</p>
    </div>

    <form @submit.prevent="verifyEligibility" class="eligibility-form">
      <div class="field-group">
        <label for="promedio">Promedio</label>
        <input
          id="promedio"
          type="number"
          step="0.1"
          min="0"
          max="10"
          v-model.number="form.promedio"
          @blur="touched.promedio = true"
          placeholder="8.5"
          autocomplete="off"
        />
        <p v-if="showError('promedio') && validation.errors.promedio" class="error">{{ validation.errors.promedio }}</p>
      </div>

      <div class="field-group">
        <label for="ingreso">Ingresos familiares</label>
        <input
          id="ingreso"
          type="number"
          step="1000"
          min="0"
          v-model.number="form.ingreso"
          @blur="touched.ingreso = true"
          placeholder="450000"
          autocomplete="off"
        />
        <p v-if="showError('ingreso') && validation.errors.ingreso" class="error">{{ validation.errors.ingreso }}</p>
      </div>

      <div class="field-group">
        <label for="cargaFamiliar">Carga familiar</label>
        <input
          id="cargaFamiliar"
          type="number"
          step="1"
          min="1"
          v-model.number="form.cargaFamiliar"
          @blur="touched.cargaFamiliar = true"
          placeholder="4"
          autocomplete="off"
        />
        <p v-if="showError('cargaFamiliar') && validation.errors.cargaFamiliar" class="error">{{ validation.errors.cargaFamiliar }}</p>
      </div>

      <div class="field-group">
        <label for="quintil">Quintil socioeconómico</label>
        <select id="quintil" v-model.number="form.quintil" @blur="touched.quintil = true">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
        </select>
        <p v-if="showError('quintil') && validation.errors.quintil" class="error">{{ validation.errors.quintil }}</p>
      </div>

      <div class="field-group">
        <label for="materiasAprobadas">Materias aprobadas</label>
        <input
          id="materiasAprobadas"
          type="number"
          step="1"
          min="1"
          v-model.number="form.materiasAprobadas"
          @blur="touched.materiasAprobadas = true"
          placeholder="8"
          autocomplete="off"
        />
        <p v-if="showError('materiasAprobadas') && validation.errors.materiasAprobadas" class="error">{{ validation.errors.materiasAprobadas }}</p>
      </div>

      <button type="submit" class="primary-button" :disabled="!isFormValid || loading">
        Verificar elegibilidad
      </button>
    </form>

    <section class="result-panel" v-if="result">
      <div :class="['result-card', result.eligible ? 'success' : 'failure']">
        <h2>{{ result.eligible ? '¡Elegible!' : 'No elegible' }}</h2>
        <p>{{ result.summary }}</p>
        <p v-if="result.eligible" class="detail">Beca asignada: <strong>{{ result.scholarship }}</strong></p>
        <ul v-if="!result.eligible">
          <li v-for="reason in result.reasons" :key="reason">{{ reason }}</li>
        </ul>
        <p class="timestamp">Resultado guardado: {{ new Date(result.evaluatedAt).toLocaleString() }}</p>
      </div>
    </section>

    <section class="limits-card" v-if="thresholds">
      <h3>Requisitos cargados</h3>
      <ul>
        <li v-for="rule in thresholds.becas" :key="rule.tipo">
          {{ rule.tipo }}: promedio mínimo {{ rule.promedioMin }}, ingresos ≤ {{ rule.ingresoMax.toLocaleString() }}, quintil ≤ {{ rule.quintilMax }}
        </li>
      </ul>
    </section>
  </section>
</template>
