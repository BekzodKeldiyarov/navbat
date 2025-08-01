'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppointmentModal from "@/app/business/[business_id]/staff/components/AppointmentModal";


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

export default function ClinicStaffPage() {
    const { business_id } = useParams();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Staff | null>(null); // 👈 добавлено

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
                        parameters: { business_id: parseInt(business_id as string, 10) },
                        offset: 0,
                        limit: 10,
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

        if (business_id) {
            fetchStaff();
        }
    }, [business_id]);

    const formatDay = (day: string) => {
        const days: Record<string, string> = {
            mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс',
        };
        return days[day] || day;
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Персонал клиники #{business_id}</h1>

            {loading && <p>Загрузка...</p>}
            {error && <p className="text-red-500">Ошибка: {error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {staff.map((doctor) => (
                    <div key={doctor.staff_id} className="border p-4 rounded shadow bg-white">
                        <img src={doctor.urlimg} alt={doctor.first_name} className="w-24 h-24 rounded-full object-cover border mb-3" />
                        <h2 className="font-semibold text-lg">
                            {doctor.last_name} {doctor.first_name} {doctor.patronymic}
                        </h2>
                        <p className="text-sm text-gray-600 mb-2">⏱ Приём: {doctor.visit_time} мин</p>
                        <ul className="text-sm text-gray-700 mb-2">
                            {doctor.weekly_schedule.map((day) => (
                                <li key={day.day}>
                                    {formatDay(day.day)}: {day.start} – {day.end}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => setSelectedDoctor(doctor)}
                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Записаться
                        </button>
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
