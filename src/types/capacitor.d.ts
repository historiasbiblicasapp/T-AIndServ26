import { Network } from '@capacitor/network'

declare module '@capacitor/core' {
  interface PluginRegistry {
    Network: typeof Network
  }
}
