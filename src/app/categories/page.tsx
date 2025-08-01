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
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 py-10 px-4 sm:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 text-center mb-10">
                Категории услуг
            </h1>

            {loading && (
                <p className="text-center text-blue-600 font-medium">Загрузка...</p>
            )}
            {error && (
                <p className="text-center text-red-500 font-medium">Ошибка: {error}</p>
            )}

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto">
                {data.map((cat) => (
                    <div
                        key={cat.sp_сategorie_id}
                        className="bg-gradient-to-r from-blue-600 to-sky-400 text-white p-6 rounded-2xl shadow-md hover:scale-[1.02] transition"
                    >
                        <h2 className="text-xl font-semibold mb-1">{cat.name}</h2>
                        {/*<p className="text-sm opacity-80">ID: {cat.sp_сategorie_id}</p>*/}
                        {/*<p className="text-sm opacity-80">Родитель: {cat.parent_id}</p>*/}
                    </div>
                ))}
            </div>
        </div>
    );
}
