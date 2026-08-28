'use client'

import { ONBOARDING_STEPS } from './onboarding-common'

type OnboardingStepperProps = {
  currentStep: number
  onStepClick: (stepId: number) => void
}

export function OnboardingStepper({ currentStep, onStepClick }: OnboardingStepperProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {ONBOARDING_STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              if (step.id < currentStep) {
                onStepClick(step.id)
              }
            }}
            className={`
              flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300
              ${
                currentStep === step.id
                  ? 'border-[#ABD600] bg-[#ABD600] text-[#283500] shadow-[0_0_16px_rgba(171,214,0,0.4)]'
                  : currentStep > step.id
                  ? 'border-[#ABD600]/60 bg-[#ABD600]/20 text-[#ABD600]'
                  : 'border-[#444933] bg-[#18181B] text-[#C4C9AC]'
              }
            `}
          >
            <step.icon className="h-4 w-4" />
          </button>
          {i < ONBOARDING_STEPS.length - 1 && (
            <div
              className={`h-0.5 w-8 rounded-full transition-all duration-300 sm:w-12 ${
                currentStep > step.id ? 'bg-[#ABD600]' : 'bg-[#444933]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
