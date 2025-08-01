'use client';

import {useEffect, useState} from 'react';

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
        mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс',
    };
    return days[day] || day;
};

export default function AppointmentModal({doctor, onClose}: Props) {
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
            const res = await fetch('http://91.99.164.161:4000/proxy/send-sms', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({parameters: {phone_number: phone}, offset: 0, limit: 10, orderBy: 'ASC'}),
            });
            const result = await res.json();
            setSessionId(result.data[0].sms_session_id);
            setOtpSent(true);
            setTimer(45);
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

            const res = await fetch('http://91.99.164.161:4000/proxy/save-schedule', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
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
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 py-10 px-4 sm:px-8">
            <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                    <h2 className="text-2xl font-semibold text-blue-800 mb-2">Запись к врачу</h2>
                    <p className="text-gray-800 mb-4">
                        {doctor.last_name} {doctor.first_name} {doctor.patronymic}
                    </p>

                    {success ? (
                        <div className="text-green-600 font-semibold text-center">
                            ✅ Запись успешно подтверждена!
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

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Номер телефона</label>
                                <input
                                    type="text"
                                    placeholder="998901234567"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {!otpSent ? (
                                <button
                                    onClick={sendSms}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md mb-4"
                                >
                                    Отправить код
                                </button>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Код
                                            подтверждения</label>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"

                                        />
                                    </div>
                                    <button
                                        onClick={confirmSchedule}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md mb-2"
                                    >
                                        Подтвердить запись
                                    </button>
                                    <button
                                        onClick={sendSms}
                                        disabled={timer > 0}
                                        className={`w-full py-2 rounded-md text-white transition ${
                                            timer > 0
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    >
                                        {timer > 0 ? `Повтор через ${timer} сек` : 'Отправить код повторно'}
                                    </button>
                                </>
                            )}

                            {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
                        </>
                    )}

                    <button
                        onClick={onClose}
                        className="mt-6 w-full text-sm text-gray-500 hover:underline text-center"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
}
