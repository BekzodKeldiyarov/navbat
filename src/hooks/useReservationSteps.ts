import { useState } from "react";
import { ScheduleItem, RegistrationRequest } from "@/types";

const steps = ['Клиника', 'Врач', 'Дата и время', 'Пациент', 'Подтверждение'];

export function useReservationSteps() {
    const [currentStep, setStep] = useState(0);
    const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
    const [registrationData, setRegistrationData] = useState<Partial<RegistrationRequest>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateRegistrationData = (data: Partial<RegistrationRequest>) => {
        setRegistrationData(prev => ({ ...prev, ...data }));
    };

    const clearError = () => setError(null);

    return {
        currentStep,
        scheduleData,
        registrationData,
        isLoading,
        error,
        next: () => setStep((prev) => Math.min(prev + 1, steps.length - 1)),
        back: () => setStep((prev) => Math.max(prev - 1, 0)),
        setStep,
        setScheduleData,
        updateRegistrationData,
        setIsLoading,
        setError,
        clearError,
        steps,
    };
}
