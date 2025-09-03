'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { storageService } from '@/lib/storage';
import { FormField } from '@/components/ui/FormField';
import { Alert } from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { PHONE_FORMAT, SMS_CODE_LENGTH } from '@/lib/constants';

interface WeeklyDay {
    day: string;
    start: string;
    end: string;
}

interface Staff {
    staff_id: string;
    first_name: string;
    last_name: string;
    patronymic: string;
    weekly_schedule: WeeklyDay[];
}

interface Props {
    doctor: Staff;
    onClose: () => void;
}

// Extend AuthUser interface to include personal data
interface ExtendedAuthUser {
    phoneNumber: string;
    accessToken: string;
    firstName?: string;
    lastName?: string;
    patronymic?: string;
}

const formatDay = (day: string) => {
    const days: Record<string, string> = {
        mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс',
    };
    return days[day] || day;
};

export default function AppointmentModal({ doctor, onClose }: Props) {
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();
    const [selectedDay, setSelectedDay] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [phone, setPhone] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [patronymic, setPatronymic] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timer, setTimer] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    // Force check authentication from localStorage
    const hasToken = storageService.getAccessToken();
    const hasPhone = storageService.getPhoneNumber();
    const isActuallyAuthenticated = !!(hasToken && hasPhone);

    // Debug logging
    console.log('AppointmentModal - authLoading:', authLoading);
    console.log('AppointmentModal - isAuthenticated (from context):', isAuthenticated);
    console.log('AppointmentModal - user (from context):', user);
    console.log('AppointmentModal - hasToken (from storage):', hasToken);
    console.log('AppointmentModal - hasPhone (from storage):', hasPhone);
    console.log('AppointmentModal - isActuallyAuthenticated (calculated):', isActuallyAuthenticated);
    console.log('AppointmentModal - storageService.isAuthenticated():', storageService.isAuthenticated());

    // Initialize form with user data if authenticated
    useEffect(() => {
        if (isActuallyAuthenticated) {
            const savedPhone = storageService.getPhoneNumber();
            console.log('AppointmentModal - savedPhone:', savedPhone);
            if (savedPhone) {
                setPhone(savedPhone);
            }
        }
    }, [isActuallyAuthenticated]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const sendSms = async () => {
        setError(null);
        setIsLoading(true);
        
        try {
            // For authenticated users, use saved phone number
            const phoneToUse = isActuallyAuthenticated ? storageService.getPhoneNumber() : phone;
            console.log('sendSms - isActuallyAuthenticated:', isActuallyAuthenticated);
            console.log('sendSms - phoneToUse:', phoneToUse);
            
            if (!phoneToUse) {
                throw new Error('Номер телефона не найден');
            }

            const res = await apiClient.sendSms(phoneToUse);
            setSessionId(res.data[0].sms_session_id);
            setOtpSent(true);
            setTimer(45);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmSchedule = async () => {
        setError(null);
        setIsLoading(true);
        
        try {
            if (!selectedDay || !selectedTime) {
                throw new Error('Выберите день и время приема');
            }

            if (!otp) {
                throw new Error('Введите SMS код');
            }

            const now = new Date();
            const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1)
                .toString()
                .padStart(2, '0')}.${now.getFullYear()}T${selectedTime}`;

            // For authenticated users, use saved data
            const scheduleData = isActuallyAuthenticated ? {
                business_id: 18, // This should come from props or context
                first_name: 'Авторизованный',
                last_name: 'Пользователь',
                patronymic: '',
                schedule: dateStr,
                phone_number: storageService.getPhoneNumber() || '',
                staff_id: doctor.staff_id,
                sms_password: parseInt(otp),
                sms_session_id: sessionId,
            } : {
                business_id: 18, // This should come from props or context
                first_name: firstName,
                last_name: lastName,
                patronymic: patronymic,
                schedule: dateStr,
                phone_number: phone,
                staff_id: doctor.staff_id,
                sms_password: parseInt(otp),
                sms_session_id: sessionId,
            };

            console.log('confirmSchedule - isActuallyAuthenticated:', isActuallyAuthenticated);
            console.log('confirmSchedule - scheduleData:', scheduleData);

            const res = await apiClient.saveSchedule(scheduleData);

            if (res.result === 'ok') {
                setSuccess(true);
            } else {
                setError(res.msg || 'Ошибка при создании записи');
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderPersonalInfoForm = () => {
        console.log('renderPersonalInfoForm - isAuthenticated (from context):', isAuthenticated);
        console.log('renderPersonalInfoForm - user (from context):', user);
        console.log('renderPersonalInfoForm - isActuallyAuthenticated (calculated):', isActuallyAuthenticated);
        console.log('renderPersonalInfoForm - storageService.isAuthenticated():', storageService.isAuthenticated());
        
        if (isActuallyAuthenticated) {
            return (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-600">✓</span>
                        <span className="text-sm font-medium text-blue-800">
                            Вы авторизованы в системе
                        </span>
                    </div>
                    <p className="text-sm text-blue-600">
                        Ваши данные будут использованы автоматически
                    </p>
                    <p className="text-xs text-blue-500 mt-2">
                        Номер телефона: {storageService.getPhoneNumber() || 'Не найден'}
                    </p>
                    <p className="text-xs text-blue-500">
                        Токен: {storageService.getAccessToken() ? '✓ Найден' : '✗ Не найден'}
                    </p>
                </div>
            );
        }

        return (
            <>
                <div className="mb-4">
                    <FormField
                        label="Имя"
                        name="firstName"
                        type="text"
                        value={firstName}
                        onChange={setFirstName}
                        placeholder="Введите имя"
                        required
                    />
                </div>

                <div className="mb-4">
                    <FormField
                        label="Фамилия"
                        name="lastName"
                        type="text"
                        value={lastName}
                        onChange={setLastName}
                        placeholder="Введите фамилию"
                        required
                    />
                </div>

                <div className="mb-4">
                    <FormField
                        label="Отчество"
                        name="patronymic"
                        type="text"
                        value={patronymic}
                        onChange={setPatronymic}
                        placeholder="Введите отчество (необязательно)"
                    />
                </div>

                <div className="mb-4">
                    <FormField
                        label="Номер телефона"
                        name="phone"
                        type="tel"
                        value={phone}
                        onChange={setPhone}
                        placeholder={PHONE_FORMAT}
                        required
                        pattern="998[0-9]{9}"
                    />
                </div>
            </>
        );
    };

    const renderSmsForm = () => {
        console.log('renderSmsForm - isAuthenticated (from context):', isAuthenticated);
        console.log('renderSmsForm - user (from context):', user);
        console.log('renderSmsForm - isActuallyAuthenticated (calculated):', isActuallyAuthenticated);
        console.log('renderSmsForm - phone:', phone);
        console.log('renderSmsForm - firstName:', firstName);
        console.log('renderSmsForm - lastName:', lastName);
        
        if (!otpSent) {
            const isDisabled = isLoading || (!isActuallyAuthenticated && (!phone || !firstName || !lastName));
            console.log('renderSmsForm - isDisabled:', isDisabled);
            
            return (
                <Button
                    onClick={sendSms}
                    disabled={isDisabled}
                    variant="primary"
                    className="w-full"
                >
                    {isLoading ? 'Отправка...' : 'Отправить SMS код'}
                </Button>
            );
        }

        return (
            <>
                <div className="mb-4">
                    <FormField
                        label="SMS код подтверждения"
                        name="otp"
                        type="text"
                        value={otp}
                        onChange={setOtp}
                        placeholder="Введите SMS код"
                        required
                        maxLength={SMS_CODE_LENGTH}
                        pattern="[0-9]+"
                    />
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={confirmSchedule}
                        disabled={isLoading || !otp}
                        variant="success"
                        className="w-full"
                    >
                        {isLoading ? 'Подтверждение...' : 'Подтвердить запись'}
                    </Button>

                    <Button
                        onClick={sendSms}
                        disabled={timer > 0 || isLoading}
                        variant="secondary"
                        className="w-full"
                    >
                        {timer > 0 ? `Повтор через ${timer} сек` : 'Отправить код повторно'}
                    </Button>
                </div>
            </>
        );
    };

    // Don't render forms until auth is initialized
    if (authLoading) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Загрузка...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-semibold text-blue-800">Запись к врачу</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-xl"
                        >
                            ×
                        </button>
                    </div>

                    <p className="text-gray-800 mb-4">
                        {doctor.last_name} {doctor.first_name} {doctor.patronymic}
                    </p>

                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl text-green-600">✓</span>
                            </div>
                            <h3 className="text-lg font-semibold text-green-800 mb-2">
                                Запись успешно подтверждена!
                            </h3>
                            <p className="text-green-600">
                                Ожидайте подтверждения от клиники
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">День недели</label>
                                <select
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={(e) => setSelectedDay(e.target.value)}
                                    value={selectedDay}
                                >
                                    <option value="">Выберите день</option>
                                    {doctor.weekly_schedule.map((day) => (
                                        <option key={day.day} value={day.day}>
                                            {formatDay(day.day)}: {day.start} – {day.end}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Время приёма</label>
                                <input
                                    type="time"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {renderPersonalInfoForm()}
                            {renderSmsForm()}

                            {error && (
                                <Alert
                                    type="error"
                                    message={error}
                                    className="mt-4"
                                />
                            )}
                        </>
                    )}

                    {!success && (
                        <button
                            onClick={onClose}
                            className="mt-6 w-full text-sm text-gray-500 hover:underline text-center"
                        >
                            Закрыть
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
