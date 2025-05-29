'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGetLoggedUser } from '@/hooks/getLoginUser';

type OneOnOne = {
    id: number;
    date: string;
    consultation: string;
    last_action: string;
    feedback: string;
    next_action: string;
}

export default function OneOnOnePage() {
    const logged_user = useGetLoggedUser();
    const router = useRouter()
    const [oneOnOnes, setOneOnOnes] = useState<OneOnOne[]>([]);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
    }, []);

    useEffect(() => {
        if (!token) return;

        const fetchOneOnOnes = async () => {
            try {
                const res = await fetch("http://localhost:8000/dailytracks/one_on_one/list/", {
                    headers: {
                        "Authorization": `Token ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setOneOnOnes(data);
                } else {
                    throw new Error('1on1の取得に失敗しました');
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchOneOnOnes();
    }, [token]);
    console.log(oneOnOnes);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-[#00004d] mb-4 text-center">
                {logged_user ? `${logged_user.username} さんの1on1` : "1on1"}
            </h1>
            <p className="text-lg text-gray-600 mb-6 text-center">
                あなたの1on1をここに残しましょう
            </p>

            <div className="flex justify-center mb-8">
                <button
                    className="bg-[#00004d] text-white px-6 py-3 rounded hover:bg-[#ff0000] transition w-fit"
                    onClick={() => router.push('/one_on_one/create')}
                >
                    新しい1on1を作成
                </button>
            </div>

            {oneOnOnes.length === 0 ? (
                <p className="text-center text-gray-500">まだ1on1がありません。</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {oneOnOnes.map((oneOnOne) => (
                        <div
                            key={oneOnOne.id}
                            className="relative border rounded-xl p-5 shadow-md hover:shadow-lg transition bg-white text-left"
                        >
                            {/* 編集ボタン */}
                            <button
                                className="absolute top-3 right-3 text-sm text-white bg-[#00004d] hover:bg-[#ff0000] px-4 py-2 rounded transition"
                                onClick={() => router.push(`/one_on_one/edit/${oneOnOne.id}`)}
                            >
                                編集
                            </button>
                            <p className="text-sm font-semibold text-[#ff0000] mb-2">
                                実施日：{oneOnOne.date}
                            </p>

                            <div className="mb-3">
                                <h3 className="font-bold text-[#00004d]">Consultation</h3>
                                <p className="whitespace-pre-wrap text-gray-800 mt-1">{oneOnOne.consultation}</p>
                            </div>

                            <div className="mb-3">
                                <h3 className="font-bold text-[#00004d]">LastAction</h3>
                                <p className="whitespace-pre-wrap text-gray-800 mt-1">{oneOnOne.last_action}</p>
                            </div>

                            <div className="mb-3">
                                <h3 className="font-bold text-[#00004d]">Feedback</h3>
                                <p className="whitespace-pre-wrap text-gray-800 mt-1">{oneOnOne.feedback}</p>
                            </div>

                            <div className="mb-3">
                                <h3 className="font-bold text-[#00004d]">NextAction</h3>
                                <p className="whitespace-pre-wrap text-gray-800 mt-1">{oneOnOne.next_action}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}