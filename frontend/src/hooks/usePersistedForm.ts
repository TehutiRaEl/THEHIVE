import { useState, useCallback, useEffect } from 'react'

export function usePersistedForm<T extends Record<string, unknown>>(
  storageKey: string,
  initialValues: T
): {
  values: T
  setValue: <K extends keyof T>(key: K, value: T[K]) => void
  reset: () => void
  isDirty: boolean
} {
  const [values, setValues] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) return { ...initialValues, ...JSON.parse(stored) }
    } catch {
      // ignore
    }
    return initialValues
  })

  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(values))
    } catch {
      // ignore storage quota errors
    }
  }, [storageKey, values])

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setIsDirty(false)
    localStorage.removeItem(storageKey)
  }, [storageKey, initialValues])

  return { values, setValue, reset, isDirty }
}
