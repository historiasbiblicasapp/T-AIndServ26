import { createContext, useContext } from 'react'

interface OfflineContextValue {
  isOnline: boolean
  pendingSync: number
  addPendingSync: () => void
  clearPendingSync: () => void
}

export const OfflineContext = createContext<OfflineContextValue>({
  isOnline: true,
  pendingSync: 0,
  addPendingSync: () => {},
  clearPendingSync: () => {},
})

export function useOffline() {
  return useContext(OfflineContext)
}
