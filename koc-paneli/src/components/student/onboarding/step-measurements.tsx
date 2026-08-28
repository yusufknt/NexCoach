'use client'

import { FormField } from './onboarding-common'

type StepMeasurementsProps = {
  initialWeight: string
  setInitialWeight: (val: string) => void
  chestCm: string
  setChestCm: (val: string) => void
  waistCm: string
  setWaistCm: (val: string) => void
  hipCm: string
  setHipCm: (val: string) => void
  neckCm: string
  setNeckCm: (val: string) => void
  rightUpperArmCm: string
  setRightUpperArmCm: (val: string) => void
  leftUpperArmCm: string
  setLeftUpperArmCm: (val: string) => void
  rightThighCm: string
  setRightThighCm: (val: string) => void
  leftThighCm: string
  setLeftThighCm: (val: string) => void
  rightCalfCm: string
  setRightCalfCm: (val: string) => void
  leftCalfCm: string
  setLeftCalfCm: (val: string) => void
  bodyFatPercentage: string
  setBodyFatPercentage: (val: string) => void
}

export function StepMeasurements({
  initialWeight,
  setInitialWeight,
  chestCm,
  setChestCm,
  waistCm,
  setWaistCm,
  hipCm,
  setHipCm,
  neckCm,
  setNeckCm,
  rightUpperArmCm,
  setRightUpperArmCm,
  leftUpperArmCm,
  setLeftUpperArmCm,
  rightThighCm,
  setRightThighCm,
  leftThighCm,
  setLeftThighCm,
  rightCalfCm,
  setRightCalfCm,
  leftCalfCm,
  setLeftCalfCm,
  bodyFatPercentage,
  setBodyFatPercentage,
}: StepMeasurementsProps) {
  return (
    <div className="space-y-5">
      <FormField label="Kilo (kg) *" htmlFor="initialWeight">
        <input
          id="initialWeight"
          type="number"
          className="input-surface w-full px-4 py-2.5"
          placeholder="80"
          value={initialWeight}
          onChange={(e) => setInitialWeight(e.target.value)}
          min={30}
          max={300}
          step="0.1"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Göğüs (cm)" htmlFor="chestCm">
          <input
            id="chestCm"
            type="number"
            className="input-surface w-full px-4 py-2.5"
            placeholder="100"
            value={chestCm}
            onChange={(e) => setChestCm(e.target.value)}
            step="0.1"
          />
        </FormField>
        <FormField label="Bel (cm)" htmlFor="waistCm">
          <input
            id="waistCm"
            type="number"
            className="input-surface w-full px-4 py-2.5"
            placeholder="85"
            value={waistCm}
            onChange={(e) => setWaistCm(e.target.value)}
            step="0.1"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Kalça (cm)" htmlFor="hipCm">
          <input
            id="hipCm"
            type="number"
            className="input-surface w-full px-4 py-2.5"
            placeholder="100"
            value={hipCm}
            onChange={(e) => setHipCm(e.target.value)}
            step="0.1"
          />
        </FormField>
        <FormField label="Boyun (cm)" htmlFor="neckCm">
          <input
            id="neckCm"
            type="number"
            className="input-surface w-full px-4 py-2.5"
            placeholder="38"
            value={neckCm}
            onChange={(e) => setNeckCm(e.target.value)}
            step="0.1"
          />
        </FormField>
      </div>

      <p className="text-xs font-medium uppercase tracking-wider text-[#ABD600]">
        Kol Ölçüleri
      </p>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Sağ Üst Kol (cm)" htmlFor="rightUpperArmCm">
          <input
            id="rightUpperArmCm"
            type="number"
            className="input-surface w-full px-4 py-2.5"
            placeholder="35"
            value={rightUpperArmCm}
            onChange={(e) => setRightUpperArmCm(e.target.value)}
            step="0.1"
          />
        </FormField>
        <FormField label="Sol Üst Kol (cm)" htmlFor="leftUpperArmCm">
          <input
            id="leftUpperArmCm"
            type="number"
            className="input-surface w-full px-4 py-2.5"
            placeholder="34"
            value={leftUpperArmCm}
            onChange={(e) => setLeftUpperArmCm(e.target.value)}
            step="0.1"
          />
        </FormField>
      </div>

      <p className="text-xs font-medium uppercase tracking-wider text-[#ABD600]">
        Bacak Ölçüleri
      </p>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Sağ Uyluk (cm)" htmlFor="rightThighCm">
          <input
            id="rightThighCm"
            type="number"
            className="input-surface w-full px-4 py-2.5"
            placeholder="58"
            value={rightThighCm}
            onChange={(e) => setRightThighCm(e.target.value)}
            step="0.1"
          />
        </FormField>
        <FormField label="Sol Uyluk (cm)" htmlFor="leftThighCm">
          <input
            id="leftThighCm"
            type="number"
            className="input-surface w-full px-4 py-2.5"
            placeholder="57"
            value={leftThighCm}
            onChange={(e) => setLeftThighCm(e.target.value)}
            step="0.1"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Sağ Baldır (cm)" htmlFor="rightCalfCm">
          <input
            id="rightCalfCm"
            type="number"
            className="input-surface w-full px-4 py-2.5"
            placeholder="38"
            value={rightCalfCm}
            onChange={(e) => setRightCalfCm(e.target.value)}
            step="0.1"
          />
        </FormField>
        <FormField label="Sol Baldır (cm)" htmlFor="leftCalfCm">
          <input
            id="leftCalfCm"
            type="number"
            className="input-surface w-full px-4 py-2.5"
            placeholder="37"
            value={leftCalfCm}
            onChange={(e) => setLeftCalfCm(e.target.value)}
            step="0.1"
          />
        </FormField>
      </div>

      <FormField label="Vücut Yağ Oranı (%)" htmlFor="bodyFatPercentage">
        <input
          id="bodyFatPercentage"
          type="number"
          className="input-surface w-full px-4 py-2.5"
          placeholder="15"
          value={bodyFatPercentage}
          onChange={(e) => setBodyFatPercentage(e.target.value)}
          min={3}
          max={60}
          step="0.1"
        />
        <p className="mt-1 text-xs text-[#C4C9AC]/70">
          Bilmiyorsanız boş bırakabilirsiniz.
        </p>
      </FormField>
    </div>
  )
}
