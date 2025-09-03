'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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

interface Business {
    business_id: number;
    parent_business_id: number;
    inn: number;
    addr: string;
    name: string;
    begin_time: string;
    end_time: string;
    description: string;
}

export default function ClinicStaffPage() {
    const { business_id } = useParams();
    const { isAuthenticated, user } = useAuth();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [businessInfo, setBusinessInfo] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Staff | null>(null);

    const formatDay = (day: string) => {
        const days: Record<string, string> = {
            mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс',
        };
        return days[day] || day;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const businessRes = await fetch('http://91.99.164.161:4000/proxy/businesses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        parameters: { business_id: parseInt(business_id as string, 10) },
                        offset: 0,
                        limit: 1,
                        orderBy: 'ASC',
                    }),
                });

                const businessData = await businessRes.json();
                const clinic = businessData?.data?.[0];
                setBusinessInfo(clinic || null);

                // Use AuthContext for token
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };

                if (isAuthenticated && user?.accessToken) {
                    headers['Authorization'] = `Bearer ${user.accessToken}`;
                }

                const staffRes = await fetch('http://91.99.164.161:4000/proxy/staff', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        parameters: { business_id: parseInt(business_id as string, 10) },
                        offset: 0,
                        limit: 10,
                        orderBy: 'ASC',
                    }),
                });

                const staffData = await staffRes.json();
                setStaff(staffData?.data || []);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        if (business_id) {
            fetchData();
        }
    }, [business_id, isAuthenticated, user]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 py-10 px-4 sm:px-8">
            <div className="max-w-6xl mx-auto">
                {loading && <p className="text-center text-gray-500">Загрузка...</p>}
                {error && <p className="text-center text-red-500">Ошибка: {error}</p>}

                {businessInfo && (
                    <div className="bg-white shadow rounded-xl p-6 mb-10 border border-blue-100">
                        <h1 className="text-3xl font-bold text-blue-900 mb-3">
                            {businessInfo.name}
                        </h1>
                        <p className="text-gray-700 mb-1">📍 <strong>Адрес:</strong> {businessInfo.addr}</p>
                        <p className="text-gray-700 mb-1">🧾 <strong>ИНН:</strong> {businessInfo.inn}</p>
                        <p className="text-gray-700 mb-1">🕒 <strong>Время работы:</strong> {businessInfo.begin_time} – {businessInfo.end_time}</p>
                        {businessInfo.description && (
                            <p className="mt-3 text-sm text-gray-800 whitespace-pre-line">
                                {businessInfo.description}
                            </p>
                        )}
                    </div>
                )}

                <h2 className="text-2xl font-semibold text-blue-800 mb-6">Доступные врачи:</h2>

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
                                <h3 className="text-lg font-semibold text-blue-800 mb-1">
                                    {doctor.last_name} {doctor.first_name} {doctor.patronymic}
                                </h3>

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
