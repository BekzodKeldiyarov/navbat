'use client';

import { useEffect, useState } from 'react';

interface Category {
    sp_сategorie_id: number;
    name: string;
    parent_id: number;
}

export default function CategoriesPage() {
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');

                const res = await fetch('http://localhost:4000/proxy/categories', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        parameters: { parent_id: 0 },
                        offset: 0,
                        limit: 10,
                        orderBy: 'ASC',
                    }),
                });

                const result = await res.json();
                setData(result?.data || []);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Категории услуг</h1>

            {loading && <p>Загрузка...</p>}
            {error && <p className="text-red-500">Ошибка: {error}</p>}

            <ul className="space-y-4">
                {data.map((cat) => (
                    <li
                        key={cat.sp_сategorie_id}
                        className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white"
                    >
                        <p className="text-lg font-medium">{cat.name}</p>
                        <p className="text-sm text-gray-500">ID: {cat.sp_сategorie_id}</p>
                        <p className="text-sm text-gray-500">Parent id: {cat.parent_id}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
