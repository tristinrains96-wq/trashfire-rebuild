// Simple toast notification system
export const toast = {
  success: (message: string) => {
    console.log('✅', message)
    // In a real app, you'd show a proper toast notification
  },
  error: (message: string) => {
    console.error('❌', message)
    // In a real app, you'd show a proper toast notification
  },
  info: (message: string) => {
    console.log('ℹ️', message)
    // In a real app, you'd show a proper toast notification
  }
}
