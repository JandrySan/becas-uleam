import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { EligibilityResult } from '../elegibilidad'

export const useEligibilityStore = defineStore('eligibility', () => {
  const last = ref<EligibilityResult | null>(null)

  function setLast(r: EligibilityResult) {
    last.value = r
  }

  return { last, setLast }
})
