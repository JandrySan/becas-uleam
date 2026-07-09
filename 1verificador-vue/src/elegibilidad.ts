export interface EligibilityInput {
  nombres: string
  apellidos: string
  cedula: string
  correo: string
  telefono: string
  carrera: string
  semestre: number
  promedio: number
  ingreso: number
  cargaFamiliar: number
  quintil: number
  materiasAprobadas: number
  discapacidad: boolean
  padreNombre: string
  padreOcupacion: string
  madreNombre: string
  madreOcupacion: string
  hermanos: number
  hermanosEstudian: number
  viveCon: string
  vivienda: string
}

export interface ScholarshipRule {
  tipo: string
  promedioMin: number
  ingresoMax: number
  quintilMax: number
}

export interface LimitsData { ingresoBasico: number; becas: ScholarshipRule[] }

export interface ValidationErrors {
  nombres?: string; apellidos?: string; cedula?: string; correo?: string; promedio?: string; ingreso?: string
  cargaFamiliar?: string; quintil?: string; materiasAprobadas?: string; semestre?: string
}
export interface ValidationResult { isValid: boolean; errors: ValidationErrors }
export interface EligibilityResult { eligible: boolean; scholarship: string; reasons: string[]; summary: string; evaluatedAt: string; input: EligibilityInput }
export const STORAGE_KEY = 'verificador-elegibilidad-result'

export function validateInput(input: EligibilityInput): ValidationResult {
  const errors: ValidationErrors = {}
  if (!input.nombres.trim()) errors.nombres = 'Ingresa los nombres.'
  if (!input.apellidos.trim()) errors.apellidos = 'Ingresa los apellidos.'
  if (!/^\d{10}$/.test(input.cedula)) errors.cedula = 'La cédula debe tener 10 dígitos.'
  if (!input.correo.includes('@')) errors.correo = 'Ingresa un correo válido.'
  if (Number.isNaN(input.semestre) || input.semestre < 1) errors.semestre = 'Ingresa un semestre válido.'
  if (Number.isNaN(input.promedio) || input.promedio < 0 || input.promedio > 10) errors.promedio = 'El promedio debe estar entre 0 y 10.'
  if (Number.isNaN(input.ingreso) || input.ingreso < 0) errors.ingreso = 'Los ingresos no pueden ser negativos.'
  if (Number.isNaN(input.cargaFamiliar) || input.cargaFamiliar < 1) errors.cargaFamiliar = 'La carga familiar debe ser al menos 1 persona.'
  if (Number.isNaN(input.quintil) || input.quintil < 1 || input.quintil > 6) errors.quintil = 'El quintil debe estar entre 1 y 6.'
  if (Number.isNaN(input.materiasAprobadas) || input.materiasAprobadas < 0) errors.materiasAprobadas = 'Ingresa materias aprobadas válidas.'
  return { isValid: Object.keys(errors).length === 0, errors }
}

export function evaluateElegibility(input: EligibilityInput, limits: LimitsData): EligibilityResult {
  const eligibleScholarships = limits.becas.filter((beca) => input.promedio >= beca.promedioMin && input.ingreso <= beca.ingresoMax && input.quintil <= beca.quintilMax)
  const scholarship = eligibleScholarships.length ? eligibleScholarships[0].tipo : 'Ninguna beca'
  const reasons: string[] = []
  if (!eligibleScholarships.length) {
    const minProm = Math.min(...limits.becas.map(b => b.promedioMin))
    const maxIngreso = Math.max(...limits.becas.map(b => b.ingresoMax))
    const maxQuintil = Math.max(...limits.becas.map(b => b.quintilMax))
    if (input.promedio < minProm) reasons.push(`Tu promedio es ${input.promedio.toFixed(1)}. El mínimo de las becas disponibles inicia en ${minProm}.`)
    if (input.ingreso > maxIngreso) reasons.push(`Tus ingresos familiares superan el rango máximo permitido para las becas registradas.`)
    if (input.quintil > maxQuintil) reasons.push(`Tu quintil es mayor al rango permitido para las becas actuales.`)
    if (!reasons.length) reasons.push('No coincide con los criterios configurados para las becas disponibles.')
  }
  const summary = eligibleScholarships.length
    ? `Elegible para ${scholarship}. Ya puedes iniciar la postulación.`
    : 'Formulario recibido, pero no cumple los requisitos mínimos para postular a una beca disponible.'
  return { eligible: eligibleScholarships.length > 0, scholarship, reasons, summary, evaluatedAt: new Date().toISOString(), input }
}
export function saveResult(result: EligibilityResult): void { localStorage.setItem(STORAGE_KEY, JSON.stringify(result)) }
export function loadResult(): EligibilityResult | null { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return null; try { return JSON.parse(raw) as EligibilityResult } catch { return null } }
export async function loadLimits(): Promise<LimitsData> {
  try { const response = await fetch('/limits.json'); if (!response.ok) throw new Error('No limits'); return (await response.json()) as LimitsData }
  catch { return { ingresoBasico: 480, becas: [ { tipo: 'Beca Socioeconómica', promedioMin: 8.5, ingresoMax: 480, quintilMax: 2 }, { tipo: 'Beca de Excelencia', promedioMin: 9.2, ingresoMax: 600, quintilMax: 3 } ] } }
}
