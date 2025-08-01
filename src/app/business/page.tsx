'use client';

import {useEffect, useState} from 'react';
import Link from "next/link";

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                        parameters: {parent_business_id: 0},
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
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Список клиник</h1>

            {loading && <p>Загрузка...</p>}
            {error && <p className="text-red-500">Ошибка: {error}</p>}

            <div className="space-y-6">
                {data.map((clinic) => (
                    <div
                        key={clinic.business_id}
                        className="border border-gray-300 rounded-xl shadow-md p-5 bg-white"
                    >
                        <h2 className="text-xl font-semibold text-blue-800 mb-1">
                            {clinic.name}
                        </h2>
                        <p className="text-sm text-gray-600 mb-2">{clinic.addr}</p>

                        <div className="text-sm text-gray-700 mb-2">
                            🕒 <strong>Время работы:</strong> {clinic.begin_time} – {clinic.end_time}
                        </div>

                        <div className="text-sm text-gray-700 mb-2">
                            🧾 <strong>ИНН:</strong> {clinic.inn}
                        </div>

                        <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                            {clinic.description}
                        </p>
                        <Link
                            href={`/business/${clinic.business_id}/staff`}
                            className="inline-block mt-3 text-blue-600 hover:underline text-sm font-medium"
                        >
                            Персонал клиники {clinic.business_id}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
