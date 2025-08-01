'use client';

import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
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
    const {business_id} = useParams();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Staff | null>(null);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const token = localStorage.getItem('token');

                const res = await fetch('http://91.99.164.161:4000/proxy/staff', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        parameters: {business_id: parseInt(business_id as string, 10)},
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
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 py-10 px-4 sm:px-8">
            <div className="max-w-6xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">
                    Персонал клиники #{business_id}
                </h1>

                {loading && <p className="text-center text-gray-500">Загрузка...</p>}
                {error && <p className="text-center text-red-500">Ошибка: {error}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {staff.map((doctor) => (
                        <div
                            key={doctor.staff_id}
                            className="bg-white border border-blue-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-5 flex gap-5"
                        >
                            <img
                                src={doctor.urlimg}
                                alt={`${doctor.first_name} ${doctor.last_name}`}
                                className="w-24 h-24 rounded-full object-cover border-2 border-blue-200"
                            />

                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-blue-800 mb-1">
                                    {doctor.last_name} {doctor.first_name} {doctor.patronymic}
                                </h2>

                                <p className="text-sm text-gray-600 mb-2">
                                    ⏱ Время приёма: {doctor.visit_time} мин
                                </p>

                                <div className="text-sm text-gray-700 mb-2">
                                    <p className="font-medium text-gray-800">Расписание:</p>
                                    <ul className="list-disc pl-4">
                                        {doctor.weekly_schedule.map((day) => (
                                            <li key={day.day}>
                                                {formatDay(day.day)}: {day.start} – {day.end}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    onClick={() => setSelectedDoctor(doctor)}
                                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
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
        </div>
    );
}
