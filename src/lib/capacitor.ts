import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { Network } from '@capacitor/network'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'

export function initCapacitor() {
  if (!Capacitor.isNativePlatform()) {
    return
  }

  StatusBar.setStyle({ style: Style.Light })
  Keyboard.setScroll({ isDisabled: true }).catch(() => {})
}

export async function registerPushNotifications() {
  if (!Capacitor.isNativePlatform()) {
    return null
  }

  const perm = await PushNotifications.requestPermissions()
  if (perm.receive !== 'granted') {
    return null
  }

  await PushNotifications.register()
  return true
}

export function listenPushNotifications(onNotification: (notification: unknown) => void) {
  if (!Capacitor.isNativePlatform()) {
    return () => {}
  }

  const sub1 = PushNotifications.addListener('pushNotificationReceived', notification => {
    onNotification(notification)
  })

  const sub2 = PushNotifications.addListener('pushNotificationActionPerformed', notification => {
    onNotification(notification)
  })

  return () => {
    try {
      ;(sub1 as unknown as { remove: () => void }).remove()
    } catch {
      // noop
    }
    try {
      ;(sub2 as unknown as { remove: () => void }).remove()
    } catch {
      // noop
    }
  }
}

export async function hapticLight() {
  if (!Capacitor.isNativePlatform()) {
    return
  }
  try {
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch {
    // noop
  }
}

export function listenNetworkChange(onChange: (connected: boolean) => void) {
  if (!Capacitor.isNativePlatform()) {
    return () => {}
  }

  const listener = Network.addListener('networkStatusChange', status => {
    onChange(status.connected)
  })

  return () => {
    try {
      ;(listener as unknown as { remove: () => void }).remove()
    } catch {
      // noop
    }
  }
}

export async function getNetworkStatus() {
  if (!Capacitor.isNativePlatform()) {
    return { connected: true }
  }
  return Network.getStatus()
}
