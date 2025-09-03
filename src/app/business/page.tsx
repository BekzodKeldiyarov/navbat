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
    const [rootBusinesses, setRootBusinesses] = useState<Business[]>([]);
    const [childrenMap, setChildrenMap] = useState<Record<number, Business[]>>({});
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBusinesses(0).then(setRootBusinesses);
    }, []);

    const fetchBusinesses = async (parentId: number): Promise<Business[]> => {
        try {
            const res = await fetch('http://91.99.164.161:4000/proxy/businesses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    parameters: { parent_business_id: parentId },
                    offset: 0,
                    limit: 100,
                    orderBy: 'ASC',
                }),
            });

            const result = await res.json();
            return result?.data || [];
        } catch (e: any) {
            setError(e.message);
            return [];
        }
    };

    const toggleExpand = async (id: number) => {
        const newExpanded = new Set(expanded);

        if (expanded.has(id)) {
            newExpanded.delete(id);
            setExpanded(newExpanded);
            return;
        }

        newExpanded.add(id);
        setExpanded(newExpanded);

        if (childrenMap[id]) {
            setExpanded(newExpanded);
            return;
        }

        setLoadingMap((prev) => ({ ...prev, [id]: true }));
        const children = await fetchBusinesses(id);
        setChildrenMap((prev) => ({ ...prev, [id]: children }));
        setLoadingMap((prev) => ({ ...prev, [id]: false }));
        setExpanded(newExpanded);
    };

    const renderBusiness = (clinic: Business, level: number = 0) => (
        <div
            key={clinic.business_id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border border-gray-200"
            style={{ marginLeft: `${level * 20}px` }}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-lg font-semibold text-blue-800">{clinic.name}</h2>
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
                <p>🕒 <strong>Время:</strong> {clinic.begin_time} – {clinic.end_time}</p>
                <p>🧾 <strong>ИНН:</strong> {clinic.inn}</p>
            </div>

            <button
                onClick={() => toggleExpand(clinic.business_id)}
                className="mt-3 text-blue-600 text-sm font-medium hover:underline"
            >
                {expanded.has(clinic.business_id)
                    ? 'Скрыть филиалы ▲'
                    : 'Показать филиалы ▼'}
            </button>

            {expanded.has(clinic.business_id) && (
                <div className="mt-4 space-y-4 border-t pt-4">
                    {loadingMap[clinic.business_id] ? (
                        <p className="text-gray-500 text-sm">Загрузка...</p>
                    ) : (
                        (childrenMap[clinic.business_id] || []).map((child) =>
                            renderBusiness(child, level + 1)
                        )
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 py-12 px-4 sm:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-800 text-center mb-10">
                Наши клиники
            </h1>

            {error && <p className="text-center text-red-500 font-medium">Ошибка: {error}</p>}

            <div className="space-y-6 max-w-5xl mx-auto">
                {rootBusinesses.map((clinic) => renderBusiness(clinic))}
            </div>
        </div>
    );
}
