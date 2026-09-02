'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Save, Lock } from 'lucide-react'
import { changePassword } from '@/lib/coach/settings.client'
import { updateProfile, uploadAvatar } from '@/lib/coach/settings-actions'
import { useToast } from '@/components/ui/toast-provider'
import type { CoachProfile } from '@/lib/coach/types'

type ProfileTabProps = {
  profile: CoachProfile
}

export function ProfileTab({ profile }: ProfileTabProps) {
  const { showToast } = useToast()
  const [fullName, setFullName] = useState(profile.fullName)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.set('avatar', file)
      const url = await uploadAvatar(formData)
      if (url) {
        setAvatarUrl(url)
        showToast('success', 'Profil fotoğrafı güncellendi!')
      } else {
        showToast('error', 'Fotoğraf yüklenemedi.')
      }
    } catch (err) {
      console.error(err)
      showToast('error', 'Fotoğraf yüklenirken beklenmeyen bir hata oluştu.')
    } finally {
      setUploading(false)
      // Reset input value so the same file can be selected again
      e.target.value = ''
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const ok = await updateProfile({ fullName, bio })
      if (ok) {
        showToast('success', 'Profil kaydedildi!')
      } else {
        showToast('error', 'Profil kaydedilemedi.')
      }
    } catch (err) {
      console.error(err)
      showToast('error', 'Profil kaydedilirken beklenmeyen bir hata oluştu.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('error', 'Yeni şifreler eşleşmiyor.')
      return
    }
    if (newPassword.length < 8) {
      showToast('error', 'Şifre en az 8 karakter olmalı.')
      return
    }
    setChangingPassword(true)
    try {
      const result = await changePassword(currentPassword, newPassword)
      if (result.success) {
        showToast('success', 'Şifre başarıyla değiştirildi!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        showToast('error', result.error ?? 'Şifre değiştirilemedi.')
      }
    } catch (err) {
      console.error(err)
      showToast('error', 'Şifre değiştirilirken beklenmeyen bir hata oluştu.')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar + Profile */}
      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Profil Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-border/60">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback className="bg-muted text-2xl text-foreground">
                  {fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 rounded-full border border-border/60 bg-card p-1.5 text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div>
              <p className="font-medium text-foreground">{fullName}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          {/* Form */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="profile-name" className="text-muted-foreground">Ad Soyad</Label>
              <Input
                id="profile-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="coach-input mt-1.5"
              />
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <Input
                value={profile.email ?? ''}
                disabled
                className="coach-input mt-1.5 opacity-50"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="profile-bio" className="text-muted-foreground">Biyografi</Label>
            <Textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Kendinizi tanıtın..."
              className="coach-input mt-1.5 min-h-[100px] resize-none"
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Kaydediliyor...' : 'Profili Kaydet'}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Lock className="h-4 w-4 text-primary" />
            Şifre Değiştir
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-pw" className="text-muted-foreground">Mevcut Şifre</Label>
            <Input
              id="current-pw"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="coach-input mt-1.5"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="new-pw" className="text-muted-foreground">Yeni Şifre</Label>
              <Input
                id="new-pw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="coach-input mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="confirm-pw" className="text-muted-foreground">Yeni Şifre (Tekrar)</Label>
              <Input
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="coach-input mt-1.5"
              />
            </div>
          </div>
          <Button onClick={handleChangePassword} disabled={changingPassword} variant="outline" className="border-border/60 text-foreground hover:bg-muted">
            {changingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
