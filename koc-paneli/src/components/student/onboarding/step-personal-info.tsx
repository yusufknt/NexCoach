'use client'

import { FormField, SelectButton } from './onboarding-common'

type StepPersonalInfoProps = {
  heightCm: string
  setHeightCm: (val: string) => void
  birthDate: string
  setBirthDate: (val: string) => void
  gender: string
  setGender: (val: string) => void
  experience: string
  setExperience: (val: string) => void
  goal: string
  setGoal: (val: string) => void
}

export function StepPersonalInfo({
  heightCm,
  setHeightCm,
  birthDate,
  setBirthDate,
  gender,
  setGender,
  experience,
  setExperience,
  goal,
  setGoal,
}: StepPersonalInfoProps) {
  return (
    <div className="space-y-5">
      <FormField label="Boy (cm) *" htmlFor="heightCm">
        <input
          id="heightCm"
          type="number"
          className="input-surface w-full px-4 py-2.5"
          placeholder="175"
          value={heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
          min={100}
          max={250}
        />
      </FormField>

      <FormField label="Doğum Tarihi *" htmlFor="birthDate">
        <input
          id="birthDate"
          type="date"
          className="input-surface w-full px-4 py-2.5"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </FormField>

      <FormField label="Cinsiyet *" htmlFor="gender">
        <div className="grid grid-cols-2 gap-3">
          <SelectButton
            selected={gender === 'male'}
            onClick={() => setGender('male')}
            label="Erkek"
          />
          <SelectButton
            selected={gender === 'female'}
            onClick={() => setGender('female')}
            label="Kadın"
          />
        </div>
      </FormField>

      <FormField label="Antrenman Deneyimi *" htmlFor="experience">
        <div className="grid grid-cols-3 gap-3">
          <SelectButton
            selected={experience === 'beginner'}
            onClick={() => setExperience('beginner')}
            label="Yeni Başlayan"
          />
          <SelectButton
            selected={experience === '1-3years'}
            onClick={() => setExperience('1-3years')}
            label="1-3 Yıl"
          />
          <SelectButton
            selected={experience === '3plus'}
            onClick={() => setExperience('3plus')}
            label="3+ Yıl"
          />
        </div>
      </FormField>

      <FormField label="Hedef *" htmlFor="goal">
        <div className="grid grid-cols-2 gap-3">
          <SelectButton
            selected={goal === 'muscle_gain'}
            onClick={() => setGoal('muscle_gain')}
            label="Kas Kazanımı"
          />
          <SelectButton
            selected={goal === 'fat_loss'}
            onClick={() => setGoal('fat_loss')}
            label="Yağ Yakımı"
          />
          <SelectButton
            selected={goal === 'recomposition'}
            onClick={() => setGoal('recomposition')}
            label="Rekomposizyon"
          />
          <SelectButton
            selected={goal === 'strength'}
            onClick={() => setGoal('strength')}
            label="Güç"
          />
        </div>
      </FormField>
    </div>
  )
}
