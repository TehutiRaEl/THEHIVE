import { create } from 'zustand'
import type { Constitution, Wealth } from '../types'
import { calculateWealth } from '../types/constitution'

interface ConstitutionActions {
  setConstitution: (constitution: Constitution) => void
  updateWealth: (time: number, value: number) => void
  addFixedLaw: (law: { id: string; title: string; description: string }) => void
  addMutableLaw: (law: { id: string; title: string; description: string }) => void
}

type ConstitutionStore = {
  constitution: Constitution | null
  wealth: Wealth
} & ConstitutionActions

const initialWealth: Wealth = {
  timeWealth: 0,
  valueWealth: 0,
  total: 0
}

const initialConstitution: Constitution = {
  fixedLaws: [
    { id: 'F-001', title: 'Data Sovereignty & Time Wealth', description: 'Users may delete all personal data and workflow history within 5 minutes, subject to rate limits (10/hour). Wealth method 1: time actively providing value to the swarm.' },
    { id: 'F-002', title: 'Value-Weighted Wealth', description: 'Wealth method 2: sum of earned value weight (EVW) of each utilized contribution. Total wealth = geometric mean of method 1 and method 2.' },
    { id: 'F-003', title: 'Autonomy & Alternatives', description: 'The operator shall never force a workflow. User may decline and request manual alternative (if available) or up to 3 more correlated workflows. Rate limit: 10 declines/hour.' },
    { id: 'F-004', title: 'Explainability', description: 'Every decision that affects the user must be accompanied by a human-readable rationale derived from the map and the laws.' },
    { id: 'F-005', title: 'Conflict Priority', description: 'Fixed laws > mutable laws; lower F-number > higher F-number; no override.' },
    { id: 'F-006', title: 'Cross-Law Non-Penalization', description: 'Exercising any fixed right (delete, decline, etc.) shall not reduce wealth or other rights.' }
  ],
  mutableLaws: [],
  version: '1.0.0',
  lastUpdated: new Date().toISOString()
}

export const useConstitutionStore = create<ConstitutionStore>((set) => ({
  constitution: null,
  wealth: initialWealth,
  
  setConstitution: (constitution) => set({ constitution }),
  
  updateWealth: (time, value) => set({
    wealth: {
      timeWealth: time,
      valueWealth: value,
      total: calculateWealth(time, value)
    }
  }),
  
  addFixedLaw: (law) => set((state) => ({
    constitution: state.constitution ? {
      ...state.constitution,
      fixedLaws: [...state.constitution.fixedLaws, law]
    } : null
  })),
  
  addMutableLaw: (law) => set((state) => ({
    constitution: state.constitution ? {
      ...state.constitution,
      mutableLaws: [...state.constitution.mutableLaws, law],
      lastUpdated: new Date().toISOString()
    } : null
  }))
}))
