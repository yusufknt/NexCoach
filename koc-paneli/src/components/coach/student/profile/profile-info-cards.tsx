import { User, Ruler, Heart } from 'lucide-react'
import type { StudentOnboardingView } from '@/lib/coach/onboarding.server'

const genderMap: Record<string, string> = {
  male: 'Erkek',
  female: 'Kadın',
}

const experienceMap: Record<string, string> = {
  beginner: 'Yeni Başlayan',
  '1-3years': '1-3 Yıl',
  '3plus': '3+ Yıl',
}

const goalMap: Record<string, string> = {
  muscle_gain: 'Kas Kazanımı',
  fat_loss: 'Yağ Yakımı',
  recomposition: 'Rekomposizyon',
  strength: 'Güç',
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function formatValue(value: string | number | null | undefined, suffix = ''): string {
  if (value === null || value === undefined) return 'Belirtilmedi'
  return `${value}${suffix}`
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#27272A]/40 last:border-0">
      <span className="coach-muted text-xs sm:text-sm">{label}</span>
      <span className="text-xs sm:text-sm font-semibold text-[#E5E1E4]">{value}</span>
    </div>
  )
}

export function SectionCard({
  icon,
  title,
  children,
  className = '',
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`coach-card p-5 border border-[#27272A] hover:border-[#ABD600]/40 transition duration-300 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-[#ABD600]/10 text-[#ABD600]">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-[#E5E1E4] uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export function ProfileInfoCards({ profile }: { profile: NonNullable<StudentOnboardingView>['profile'] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left Column: Personal Info & Health */}
      <div className="space-y-6">
        <SectionCard
          icon={<User className="h-4 w-4" />}
          title="Kişisel Bilgiler"
        >
          <div className="divide-y divide-[#27272A]/40">
            <InfoRow
              label="Boy"
              value={formatValue(profile.height_cm, ' cm')}
            />
            <InfoRow
              label="Yaş"
              value={
                profile.birth_date
                  ? `${calculateAge(profile.birth_date)} Yaş (${new Date(profile.birth_date).toLocaleDateString('tr-TR')})`
                  : 'Belirtilmedi'
              }
            />
            <InfoRow
              label="Cinsiyet"
              value={profile.gender ? (genderMap[profile.gender] ?? 'Belirtilmedi') : 'Belirtilmedi'}
            />
            <InfoRow
              label="Deneyim Seviyesi"
              value={
                profile.experience
                  ? (experienceMap[profile.experience] ?? 'Belirtilmedi')
                  : 'Belirtilmedi'
              }
            />
            <InfoRow
              label="Hedef"
              value={profile.goal ? (goalMap[profile.goal] ?? 'Belirtilmedi') : 'Belirtilmedi'}
            />
          </div>
        </SectionCard>

        <SectionCard
          icon={<Heart className="h-4 w-4" />}
          title="Sağlık ve Supplement Kullanımı"
        >
          <div className="space-y-4">
            <div>
              <span className="text-xs text-[#C4C9AC] block font-semibold mb-1">Sakatlık veya Kısıtlamalar</span>
              <p className="text-xs text-[#E5E1E4] bg-[#131315]/50 border border-[#27272A] rounded-lg p-3 min-h-[50px] leading-relaxed">
                {profile.injuries ?? 'Herhangi bir sakatlık belirtilmedi.'}
              </p>
            </div>
            <div>
              <span className="text-xs text-[#C4C9AC] block font-semibold mb-1">Kullanılan Supplementler</span>
              <p className="text-xs text-[#E5E1E4] bg-[#131315]/50 border border-[#27272A] rounded-lg p-3 min-h-[50px] leading-relaxed">
                {profile.supplements ?? 'Kullanılan supplement belirtilmedi.'}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Right Column: Measurements */}
      <SectionCard
        icon={<Ruler className="h-4 w-4" />}
        title="Başlangıç Fiziksel Ölçüleri"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <InfoRow label="Kilo" value={formatValue(profile.initial_weight, ' kg')} />
          <InfoRow label="Bel Çevresi" value={formatValue(profile.waist_cm, ' cm')} />
          <InfoRow label="Göğüs Çevresi" value={formatValue(profile.chest_cm, ' cm')} />
          <InfoRow label="Kalça Çevresi" value={formatValue(profile.hip_cm, ' cm')} />
          <InfoRow label="Boyun Çevresi" value={formatValue(profile.neck_cm, ' cm')} />
          <InfoRow label="Vücut Yağ Oranı" value={formatValue(profile.body_fat_percentage, ' %')} />
          <InfoRow label="Sağ Üst Kol" value={formatValue(profile.right_upper_arm_cm, ' cm')} />
          <InfoRow label="Sol Üst Kol" value={formatValue(profile.left_upper_arm_cm, ' cm')} />
          <InfoRow label="Sağ Uyluk" value={formatValue(profile.right_thigh_cm, ' cm')} />
          <InfoRow label="Sol Uyluk" value={formatValue(profile.left_thigh_cm, ' cm')} />
          <InfoRow label="Sağ Baldır" value={formatValue(profile.right_calf_cm, ' cm')} />
          <InfoRow label="Sol Baldır" value={formatValue(profile.left_calf_cm, ' cm')} />
        </div>
      </SectionCard>
    </div>
  )
}
