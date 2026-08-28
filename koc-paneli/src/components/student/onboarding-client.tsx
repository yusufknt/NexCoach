'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { submitOnboarding } from '@/lib/student/onboarding-actions'
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { ONBOARDING_STEPS, type PhotoPreview } from './onboarding/onboarding-common'
import { OnboardingStepper } from './onboarding/onboarding-stepper'
import { StepPersonalInfo } from './onboarding/step-personal-info'
import { StepMeasurements } from './onboarding/step-measurements'
import { StepHealthPhotos } from './onboarding/step-health-photos'

export function OnboardingClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Personal info
  const [heightCm, setHeightCm] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [experience, setExperience] = useState('')
  const [goal, setGoal] = useState('')

  // Step 2: Measurements
  const [initialWeight, setInitialWeight] = useState('')
  const [chestCm, setChestCm] = useState('')
  const [waistCm, setWaistCm] = useState('')
  const [hipCm, setHipCm] = useState('')
  const [neckCm, setNeckCm] = useState('')
  const [rightUpperArmCm, setRightUpperArmCm] = useState('')
  const [leftUpperArmCm, setLeftUpperArmCm] = useState('')
  const [rightThighCm, setRightThighCm] = useState('')
  const [leftThighCm, setLeftThighCm] = useState('')
  const [rightCalfCm, setRightCalfCm] = useState('')
  const [leftCalfCm, setLeftCalfCm] = useState('')
  const [bodyFatPercentage, setBodyFatPercentage] = useState('')

  // Step 3: Health & Photos
  const [injuries, setInjuries] = useState('')
  const [supplements, setSupplements] = useState('')
  const [photoFront, setPhotoFront] = useState<PhotoPreview | null>(null)
  const [photoSide, setPhotoSide] = useState<PhotoPreview | null>(null)
  const [photoBack, setPhotoBack] = useState<PhotoPreview | null>(null)

  const frontInputRef = useRef<HTMLInputElement>(null)
  const sideInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  function validateStep1(): boolean {
    if (!heightCm || !birthDate || !gender || !experience || !goal) {
      setError('Lütfen tüm zorunlu alanları doldurun.')
      return false
    }
    const h = parseFloat(heightCm)
    if (Number.isNaN(h) || h < 100 || h > 250) {
      setError('Boy değeri 100-250 cm arasında olmalıdır.')
      return false
    }
    return true
  }

  function validateStep2(): boolean {
    if (!initialWeight) {
      setError('Kilo alanı zorunludur.')
      return false
    }
    const w = parseFloat(initialWeight)
    if (Number.isNaN(w) || w < 30 || w > 300) {
      setError('Kilo değeri 30-300 kg arasında olmalıdır.')
      return false
    }
    return true
  }

  function nextStep() {
    setError(null)
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    setCurrentStep((s) => Math.min(s + 1, 3))
  }

  function prevStep() {
    setError(null)
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  function handlePhotoChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (p: PhotoPreview | null) => void
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Sadece resim dosyaları kabul edilir.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu 10MB\'dan küçük olmalıdır.')
      return
    }
    setter({ file, url: URL.createObjectURL(file) })
  }

  function removePhoto(
    setter: (p: PhotoPreview | null) => void,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) {
    setter(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleSubmit() {
    setError(null)
    if (!validateStep1() || !validateStep2()) {
      setCurrentStep(1)
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()

    // Step 1
    formData.set('heightCm', heightCm)
    formData.set('birthDate', birthDate)
    formData.set('gender', gender)
    formData.set('experience', experience)
    formData.set('goal', goal)

    // Step 2
    formData.set('initialWeight', initialWeight)
    if (chestCm) formData.set('chestCm', chestCm)
    if (waistCm) formData.set('waistCm', waistCm)
    if (hipCm) formData.set('hipCm', hipCm)
    if (neckCm) formData.set('neckCm', neckCm)
    if (rightUpperArmCm) formData.set('rightUpperArmCm', rightUpperArmCm)
    if (leftUpperArmCm) formData.set('leftUpperArmCm', leftUpperArmCm)
    if (rightThighCm) formData.set('rightThighCm', rightThighCm)
    if (leftThighCm) formData.set('leftThighCm', leftThighCm)
    if (rightCalfCm) formData.set('rightCalfCm', rightCalfCm)
    if (leftCalfCm) formData.set('leftCalfCm', leftCalfCm)
    if (bodyFatPercentage) formData.set('bodyFatPercentage', bodyFatPercentage)

    // Step 3
    if (injuries) formData.set('injuries', injuries)
    if (supplements) formData.set('supplements', supplements)
    if (photoFront) formData.set('photoFront', photoFront.file)
    if (photoSide) formData.set('photoSide', photoSide.file)
    if (photoBack) formData.set('photoBack', photoBack.file)

    const result = await submitOnboarding(formData)

    if (!result.success) {
      setError(result.error ?? 'Bir hata oluştu.')
      setIsSubmitting(false)
      return
    }

    router.push('/student/dashboard')
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <h1 className="font-heading text-3xl font-extrabold uppercase tracking-tight text-[#E5E1E4]">
          Hoş Geldiniz
        </h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#ABD600]">
          Kinetic Performance
        </p>
        <p className="mt-3 text-sm text-[#C4C9AC]">
          Başlamadan önce sizi daha iyi tanımamız gerekiyor.
        </p>
      </div>

      {/* Step indicator */}
      <OnboardingStepper
        currentStep={currentStep}
        onStepClick={(stepId) => {
          setError(null)
          setCurrentStep(stepId)
        }}
      />

      {/* Step title */}
      <div className="text-center">
        <h2 className="text-lg font-bold text-[#E5E1E4]">
          {ONBOARDING_STEPS[currentStep - 1].title}
        </h2>
      </div>

      {/* Form card */}
      <div className="surface-card p-6 sm:p-8">
        {currentStep === 1 && (
          <StepPersonalInfo
            heightCm={heightCm}
            setHeightCm={setHeightCm}
            birthDate={birthDate}
            setBirthDate={setBirthDate}
            gender={gender}
            setGender={setGender}
            experience={experience}
            setExperience={setExperience}
            goal={goal}
            setGoal={setGoal}
          />
        )}

        {currentStep === 2 && (
          <StepMeasurements
            initialWeight={initialWeight}
            setInitialWeight={setInitialWeight}
            chestCm={chestCm}
            setChestCm={setChestCm}
            waistCm={waistCm}
            setWaistCm={setWaistCm}
            hipCm={hipCm}
            setHipCm={setHipCm}
            neckCm={neckCm}
            setNeckCm={setNeckCm}
            rightUpperArmCm={rightUpperArmCm}
            setRightUpperArmCm={setRightUpperArmCm}
            leftUpperArmCm={leftUpperArmCm}
            setLeftUpperArmCm={setLeftUpperArmCm}
            rightThighCm={rightThighCm}
            setRightThighCm={setRightThighCm}
            leftThighCm={leftThighCm}
            setLeftThighCm={setLeftThighCm}
            rightCalfCm={rightCalfCm}
            setRightCalfCm={setRightCalfCm}
            leftCalfCm={leftCalfCm}
            setLeftCalfCm={setLeftCalfCm}
            bodyFatPercentage={bodyFatPercentage}
            setBodyFatPercentage={setBodyFatPercentage}
          />
        )}

        {currentStep === 3 && (
          <StepHealthPhotos
            injuries={injuries}
            setInjuries={setInjuries}
            supplements={supplements}
            setSupplements={setSupplements}
            photoFront={photoFront}
            setPhotoFront={setPhotoFront}
            photoSide={photoSide}
            setPhotoSide={setPhotoSide}
            photoBack={photoBack}
            setPhotoBack={setPhotoBack}
            frontInputRef={frontInputRef}
            sideInputRef={sideInputRef}
            backInputRef={backInputRef}
            onPhotoChange={handlePhotoChange}
            onRemovePhoto={removePhoto}
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 rounded-xl border border-[#444933] px-5 py-2.5 text-sm font-medium text-[#C4C9AC] transition-all duration-200 hover:border-[#ABD600]/40 hover:text-[#E5E1E4]"
          >
            <ChevronLeft className="h-4 w-4" />
            Geri
          </button>
        ) : (
          <div />
        )}

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="btn-primary-glow flex items-center gap-2 px-6 py-2.5 text-sm"
          >
            İleri
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary-glow flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              'Tamamla'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
