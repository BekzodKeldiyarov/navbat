import {useState} from "react";

const steps = ['Клиника', 'Врач', 'Дата и время', 'Пациент', 'Подтверждение'];

export function useReservationSteps() {
    const [currentStep, setStep] = useState(0);

    return {
        currentStep,
        next: () => setStep((prev) => Math.min(prev + 1, steps.length - 1)),
        back: () => setStep((prev) => Math.max(prev - 1, 0)),
        steps,
    };
}
