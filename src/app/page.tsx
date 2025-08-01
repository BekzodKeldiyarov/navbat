'use client';

import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 font-sans flex flex-col items-center p-6 sm:p-12">
            {/* Лого */}
            <div className="mt-6 mb-12">
                <h1 className="text-3xl sm:text-4xl font-bold text-blue-700">
                    Navbat 2025
                </h1>
            </div>

            {/* Основные кнопки */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md w-full">
                <Link
                    href="/categories"
                    className="bg-gradient-to-r from-blue-600 to-sky-400 text-white text-center py-6 px-4 rounded-2xl shadow-md hover:scale-[1.02] transition font-semibold text-lg"
                >
                    Категории услуг
                </Link>
                <Link
                    href="/business"
                    className="bg-gradient-to-r from-blue-600 to-sky-400 text-white text-center py-6 px-4 rounded-2xl shadow-md hover:scale-[1.02] transition font-semibold text-lg"
                >
                    Клиники и адреса
                </Link>
                <Link
                    href="#"
                    className="bg-blue-100 text-blue-800 text-center py-6 px-4 rounded-2xl shadow-inner hover:scale-[1.02] transition font-medium text-base"
                >
                    История болезни
                </Link>
                <Link
                    href="#"
                    className="bg-blue-100 text-blue-800 text-center py-6 px-4 rounded-2xl shadow-inner hover:scale-[1.02] transition font-medium text-base"
                >
                    Текущие записи
                </Link>
            </div>

            {/* Футер или доп. инфо */}
            <footer className="mt-20 text-sm text-gray-500">
                © {new Date().getFullYear()} Navbat. All rights reserved.
            </footer>
        </div>
    );
}
