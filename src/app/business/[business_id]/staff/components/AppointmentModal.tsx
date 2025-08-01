'use client';

import { useEffect, useState } from 'react';

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

const formatDay = (day: string) => {
    const days: Record<string, string> = {
        mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс'
    };
    return days[day] || day;
};

export default function AppointmentModal({ doctor, onClose }: Props) {
    const [selectedDay, setSelectedDay] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [phone, setPhone] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timer, setTimer] = useState<number>(0);

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
        try {
            const res = await fetch('http://localhost:4000/proxy/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parameters: { phone_number: phone }, offset: 0, limit: 10, orderBy: 'ASC' }),
            });
            const result = await res.json();
            setSessionId(result.data[0].sms_session_id);
            setOtpSent(true);
            setTimer(45); // ⏱️ запуск таймера
        } catch (e: any) {
            setError(e.message);
        }
    };

    const confirmSchedule = async () => {
        setError(null);
        try {
            const now = new Date();
            const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1)
                .toString()
                .padStart(2, '0')}.${now.getFullYear()}T${selectedTime}`;

            const res = await fetch('http://localhost:4000/proxy/save-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    parameters: {
                        business_id: 18,
                        first_name: 'Test 1',
                        last_name: '',
                        patronymic: '',
                        schedule: dateStr,
                        phone_number: phone,
                        staff_id: doctor.staff_id,
                        sms_password: parseInt(otp),
                        sms_session_id: sessionId,
                    },
                    offset: 0,
                    limit: 10,
                    orderBy: 'ASC',
                }),
            });

            const result = await res.json();
            if (result.result === 'ok') {
                setSuccess(true);
            } else {
                setError(result.msg || 'Ошибка');
            }
        } catch (e: any) {
            setError(e.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Запись к врачу</h2>
                <p className="mb-2">{doctor.last_name} {doctor.first_name} {doctor.patronymic}</p>

                {success ? (
                    <p className="text-green-600 font-semibold">Запись успешно подтверждена!</p>
                ) : (
                    <>
                        <label className="block mb-2">День недели:</label>
                        <select
                            className="w-full border p-2 rounded mb-4"
                            onChange={(e) => setSelectedDay(e.target.value)}
                            value={selectedDay}
                        >
                            <option value="">Выберите день</option>
                            {doctor.weekly_schedule.map((day) => (
                                <option key={day.day} value={day.day}>
                                    {formatDay(day.day)}: {day.start} - {day.end}
                                </option>
                            ))}
                        </select>

                        <label className="block mb-2">Время приёма:</label>
                        <input
                            className="w-full border p-2 rounded mb-4"
                            type="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                        />

                        <label className="block mb-2">Номер телефона:</label>
                        <input
                            className="w-full border p-2 rounded mb-4"
                            type="text"
                            placeholder="998901234567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />

                        {!otpSent ? (
                            <button
                                onClick={sendSms}
                                className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-4"
                            >
                                Отправить код
                            </button>
                        ) : (
                            <>
                                <label className="block mb-2">Код подтверждения:</label>
                                <input
                                    className="w-full border p-2 rounded mb-4"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                                <button
                                    onClick={confirmSchedule}
                                    className="bg-green-600 text-white px-4 py-2 rounded w-full mb-2"
                                >
                                    Подтвердить запись
                                </button>
                                <button
                                    onClick={sendSms}
                                    disabled={timer > 0}
                                    className={`w-full py-2 rounded text-white ${
                                        timer > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    {timer > 0 ? `Отправить повторно через ${timer} сек` : 'Отправить код повторно'}
                                </button>
                            </>
                        )}

                        {error && <p className="text-red-600 mt-2">{error}</p>}
                    </>
                )}

                <button
                    onClick={onClose}
                    className="mt-4 text-sm text-gray-500 hover:underline"
                >
                    Закрыть
                </button>
            </div>
        </div>
    );
}
