import { authClient } from '@/lib/auth-client'

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await authClient.changePassword({ newPassword, currentPassword })
  if (error) {
    return { success: false, error: error.message || 'Şifre güncellenirken bir hata oluştu' }
  }
  return { success: true }
}
