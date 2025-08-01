'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

export default function BusinessesPage() {
    const [data, setData] = useState<Business[]>([]);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const toggleExpand = (id: number) => {
        setExpanded((prev) => (prev === id ? null : id));
    };

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:4000/proxy/businesses', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        parameters: { parent_business_id: 0 },
                        offset: 0,
                        limit: 10,
                        orderBy: 'ASC',
                    }),
                });

                if (!res.ok) throw new Error(`HTTP error! ${res.status}`);

                const result = await res.json();
                setData(result?.data || []);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBusinesses();
    }, []);

    return (
        <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-800 text-center mb-10">
                Наши клиники
            </h1>

            {loading && <p className="text-center text-blue-600 font-medium">Загрузка...</p>}
            {error && <p className="text-center text-red-500 font-medium">Ошибка: {error}</p>}

            <div className="space-y-6 max-w-4xl mx-auto">
                {data.map((clinic) => (
                    <div
                        key={clinic.business_id}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border border-gray-100"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-semibold text-blue-800 mb-1">
                                    {clinic.name}
                                </h2>
                                <p className="text-sm text-gray-600">{clinic.addr}</p>
                            </div>
                            <Link
                                href={`/business/${clinic.business_id}/staff`}
                                className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 transition"
                            >
                                Персонал
                            </Link>
                        </div>

                        <div className="mt-3 text-sm text-gray-700 space-y-1">
                            <p>🕒 <strong>Время работы:</strong> {clinic.begin_time} – {clinic.end_time}</p>
                            <p>🧾 <strong>ИНН:</strong> {clinic.inn}</p>
                        </div>

                        <button
                            onClick={() => toggleExpand(clinic.business_id)}
                            className="mt-3 text-blue-600 text-sm font-medium hover:underline focus:outline-none"
                        >
                            {expanded === clinic.business_id ? 'Скрыть описание ▲' : 'Подробнее ▼'}
                        </button>

                        {expanded === clinic.business_id && (
                            <p className="mt-3 text-sm text-gray-800 whitespace-pre-line leading-relaxed border-t pt-3">
                                {clinic.description}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
