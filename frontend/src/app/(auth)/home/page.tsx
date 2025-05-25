'use client'
import { useEffect, useState } from 'react';
import { useGetLoggedUser } from '@/hooks/getLoginUser';

type Diary = {
    id: number;
    content: string;
    mood: number;
    created_at: string;
};

const moodLabels: Record<number, string> = {
        1: "絶好調",
        2: "良好",
        3: "普通",
        4: "不調",
        5: "絶不調",
    };

export default function HomePage() {
    const logged_user = useGetLoggedUser();
    const [latestDiary, setLatestDiary] = useState<Diary | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
    }, []);

    useEffect(() => {
        if (!token) return;

        const fetchLatestDiary = async () => {
            try {
                const res = await fetch("http://localhost:8000/dailytracks/diary/latest/", {
                    headers: {
                        "Authorization": `Token ${token}`,
                    },
                });

                if(res.ok) {
                    const data = await res.json();
                    setLatestDiary(data);
                } else {
                    throw new Error('最新の日記の取得に失敗しました');
                }
            } catch (error){
                console.error(error);
            }
        };

        fetchLatestDiary();
    }, [token]);

    return (
    <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-[#00004d] text-center mb-2">
            {logged_user ? `${logged_user.username} さんの日々の軌跡` : "ホーム"}
        </h1>
        <p className="text-lg text-gray-600 text-center mb-10">
            あなたの足跡をここに残しましょう
        </p>

        {/* 日記セクション */}
        <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-semibold text-[#00004d] mb-4 flex items-center gap-2">
                <span>最新の日記</span>
            </h2>

            {latestDiary ? (
                <div className="border rounded-xl shadow-md p-6 bg-white">
                    <p className="text-sm text-gray-500 mb-2">{latestDiary.created_at}</p>
                    <p className="text-[#ff0000] font-semibold mb-2">
                        気分: {moodLabels[latestDiary.mood]}
                    </p>
                    <p className="text-gray-800">{latestDiary.content}</p>
                </div>
            ) : (
                <p className="text-gray-500">まだ日記がありません。</p>
            )}
        </section>

        {/* 今後のセクション用のスペース */}
        {/* 
        <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-semibold text-[#00004d] mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <span>最新の目標</span>
            </h2>
            ...
        </section>

        <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#00004d] mb-4 flex items-center gap-2">
                <span className="text-2xl">🤝</span>
                <span>最新の1on1</span>
            </h2>
            ...
        </section>
        */}
    </div>
);

}
