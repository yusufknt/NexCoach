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
                  ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_16px_rgba(171,214,0,0.4)]'
                  : currentStep > step.id
                  ? 'border-primary/60 bg-primary/20 text-primary'
                  : 'border-border/60 bg-muted/30 text-muted-foreground'
              }
            `}
          >
            <step.icon className="h-4 w-4" />
          </button>
          {i < ONBOARDING_STEPS.length - 1 && (
            <div
              className={`h-0.5 w-8 rounded-full transition-all duration-300 sm:w-12 ${
                currentStep > step.id ? 'bg-primary' : 'bg-[#444933]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
