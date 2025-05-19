// frontend/src/app/(auth)/layout.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Cog6ToothIcon } from '@heroicons/react/24/solid'; // 歯車アイコン

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();

    return (
        <div className="flex min-h-screen bg-white text-gray-900">
            {/* 左メニュー */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-[#00004d] text-white p-4 flex flex-col justify-between`}>
                {/* 上部ロゴ + メニュー */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        {isSidebarOpen && <h2 className="text-xl font-bold">DailyTracks</h2>}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-white hover:text-[#ff0000] focus:outline-none"
                            aria-label="メニュー開閉"
                        >
                            {/* ≡ アイコン */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <nav className={`space-y-3 ${isSidebarOpen ? 'block' : 'hidden'}`}>
                        <Link
                            href="/home"
                            className="block py-2 px-3 rounded-md hover:bg-[#ff0000] hover:text-white transition"
                        >
                            ホーム
                        </Link>
                    </nav>
                </div>

                {/* 下部ログアウト */}
                <div className={`${isSidebarOpen ? 'block' : 'hidden'}`}>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            router.push('/login');
                        }}
                        className="w-full py-2 px-3 text-left rounded-md hover:bg-red-600 transition text-white"
                    >
                        ログアウト
                    </button>
                </div>
            </aside>

            {/* メインコンテンツ */}
            <main className="flex-1 p-10">
                {/* 設定ボタン */}
                <div className="absolute top-4 right-6">
                    <button
                        onClick={() => router.push('/settings')}
                        className="text-[#00004d] hover:text-[#ff0000] transition"
                        aria-label="設定"
                    >
                        <Cog6ToothIcon className="w-6 h-6" />
                    </button>
                </div>

                {children}
            </main>
        </div>
    );
}
