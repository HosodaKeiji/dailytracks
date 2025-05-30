'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGetLoggedUser } from '@/hooks/getLoginUser';
import LoadingSpinner from '@/components/LoadingSpinner';

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

export default function DiaryPage() {
    const logged_user = useGetLoggedUser();
    const router = useRouter()
    const [diaries, setDiaries] = useState<Diary[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
    }, []);

    useEffect(() => {
        if (!token) return;

        const fetchDiaries = async () => {
            try {
                const res = await fetch("http://localhost:8000/dailytracks/diary/list/", {
                    headers: {
                        "Authorization": `Token ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setDiaries(data);
                } else {
                    throw new Error('日記の取得に失敗しました');
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        };

        fetchDiaries();
    }, [token]);

    if (loading) {
            return <LoadingSpinner />;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-[#00004d] mb-4 text-center">
                {logged_user ? `${logged_user.username} さんの日記` : "日記"}
            </h1>

            <p className="text-lg text-gray-600 mb-6 text-center">
                あなたの日記をここに残しましょう
            </p>

            <div className="flex justify-center mb-8">
                <button
                    className="bg-[#00004d] text-white px-6 py-3 rounded hover:bg-[#ff0000] transition w-fit"
                    onClick={() => router.push('/diary/create')}
                >
                    新しい日記を作成
                </button>
            </div>

            {diaries.length === 0 ? (
                <p className="text-center text-gray-500">まだ日記がありません。</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {diaries.map((diary) => (
                        <div key={diary.id} className="border rounded-xl p-5 shadow-md hover:shadow-lg transition bg-white">
                            <p className="text-sm text-[#00004d] mb-1">{diary.created_at}</p>
                            <p className="font-semibold text-[#00004d]">気分: {moodLabels[diary.mood]}</p>
                            <p className="mt-3 whitespace-pre-wrap">{diary.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}