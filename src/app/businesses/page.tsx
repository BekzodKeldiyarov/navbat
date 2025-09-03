'use client';

import { useEffect, useState } from 'react';
import { Building2, MapPin, Clock, Star, Loader2 } from 'lucide-react';
import BusinessCard from '@/components/business/BusinessCard';

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
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        try {
            setLoading(true);
            
            // Get access token if available
            const accessToken = localStorage.getItem('access_token');
            
            const res = await fetch('http://91.99.164.161:4000/proxy/businesses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
                },
                body: JSON.stringify({
                    parameters: {},
                    offset: 0,
                    limit: 100,
                    orderBy: 'ASC',
                }),
            });

            const result = await res.json();
            console.log('Businesses API response:', result);
            
            if (result.result === 'ok' && result.data) {
                setBusinesses(result.data);
            } else {
                setError('Ошибка при загрузке клиник');
            }
        } catch (e) {
            console.error('Ошибка при загрузке клиник:', e);
            setError('Ошибка при загрузке клиник');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-lg text-gray-600">Загрузка клиник...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center">
                <div className="text-center max-w-2xl">
                    <p className="text-xl text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={fetchBusinesses}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 py-10 px-4 sm:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Все клиники</h1>
                    <p className="text-xl text-gray-600">Найдите подходящую клинику для записи на прием</p>
                </div>

                {/* Businesses Grid */}
                {businesses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {businesses.map((business) => (
                            <BusinessCard 
                                key={business.business_id} 
                                business={business}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Клиники не найдены</h3>
                        <p className="text-gray-500">Попробуйте обновить страницу или обратитесь в поддержку</p>
                    </div>
                )}
            </div>
        </div>
    );
}
