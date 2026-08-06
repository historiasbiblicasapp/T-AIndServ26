import { useState, useEffect } from 'react'
import { OfflineContext } from '@/contexts/OfflineContext'
import { listenNetworkChange, getNetworkStatus } from '@/lib/capacitor'

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSync, setPendingSync] = useState(0)

  useEffect(() => {
    getNetworkStatus().then(status => setIsOnline(status.connected))
    const unlisten = listenNetworkChange(connected => {
      setIsOnline(connected)
      if (connected) {
        syncPending()
      }
    })
    return unlisten
  }, [])

  const syncPending = async () => {
    setPendingSync(0)
  }

  const addPendingSync = () => {
    setPendingSync(prev => prev + 1)
  }

  const clearPendingSync = () => {
    setPendingSync(0)
  }

  return (
    <OfflineContext.Provider value={{ isOnline, pendingSync, addPendingSync, clearPendingSync }}>
      {children}
    </OfflineContext.Provider>
  )
}
