import { useState, useCallback, useEffect } from 'react'

type AsyncState<T> = {
  data: T | null
  error: Error | null
  loading: boolean
}

export function useAsyncState<T>(
  asyncFunction: () => Promise<T>,
  initialState: AsyncState<T> = { data: null, error: null, loading: false }
): [AsyncState<T>, () => void] {
  const [state, setState] = useState<AsyncState<T>>(initialState)

  const execute = useCallback(() => {
    setState({ data: null, error: null, loading: true })

    asyncFunction()
      .then((data) => {
        setState({ data, error: null, loading: false })
      })
      .catch((error) => {
        setState({ data: null, error, loading: false })
      })
  }, [asyncFunction])

  useEffect(() => {
    if (!initialState.data && !initialState.error) {
      execute()
    }
  }, [execute, initialState.data, initialState.error])

  return [state, execute]
}
