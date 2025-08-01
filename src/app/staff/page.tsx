'use client';

import { useEffect, useState } from 'react';
import AppointmentModal from '@/app/business/[business_id]/staff/components/AppointmentModal';

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
    urlimg: string;
    visit_time: number;
    weekly_schedule: WeeklyDay[];
}

export default function StaffPage() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Staff | null>(null);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const token = localStorage.getItem('token');

                const res = await fetch('http://localhost:4000/proxy/staff', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        parameters: { business_id: 18 },
                        offset: 0,
                        limit: 3,
                        orderBy: 'ASC',
                    }),
                });

                const result = await res.json();
                setStaff(result?.data || []);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, []);

    const formatDay = (day: string) => {
        const days: Record<string, string> = {
            mon: 'Пн',
            tue: 'Вт',
            wed: 'Ср',
            thu: 'Чт',
            fri: 'Пт',
            sat: 'Сб',
            sun: 'Вс',
        };
        return days[day] || day;
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Список врачей</h1>

            {loading && <p>Загрузка...</p>}
            {error && <p className="text-red-500">Ошибка: {error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {staff.map((doctor) => (
                    <div
                        key={doctor.staff_id}
                        className="border rounded-lg p-4 shadow bg-white flex gap-4"
                    >
                        <img
                            src={doctor.urlimg}
                            alt={`${doctor.first_name} ${doctor.last_name}`}
                            className="w-24 h-24 rounded-full object-cover border"
                        />

                        <div className="flex-1">
                            <h2 className="text-lg font-semibold">
                                {doctor.last_name} {doctor.first_name} {doctor.patronymic}
                            </h2>

                            <p className="text-sm text-gray-600 mb-2">
                                ⏱ Приём: {doctor.visit_time} мин
                            </p>

                            <div className="text-sm text-gray-700">
                                <p className="font-semibold mb-1">Расписание:</p>
                                <ul className="space-y-1">
                                    {doctor.weekly_schedule.map((day) => (
                                        <li key={day.day}>
                                            {formatDay(day.day)}: {day.start} – {day.end}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button
                                onClick={() => setSelectedDoctor(doctor)}
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Записаться
                            </button>
                        </div>


                    </div>
                ))}
            </div>
            {selectedDoctor && (
                <AppointmentModal
                    doctor={selectedDoctor}
                    onClose={() => setSelectedDoctor(null)}
                />
            )}

        </div>
    );
}
