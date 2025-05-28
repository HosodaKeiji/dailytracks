'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGetLoggedUser } from '@/hooks/getLoginUser';

type Pdca = {
    id: number;
    week_date: string;
    plan: string;
    execution: string;
    review: string;
    action: string;
    feedback: string;
}

export default function PdcaPage() {
    const logged_user = useGetLoggedUser();
    const router = useRouter()
    const [pdcas, setPdcas] = useState<Pdca[]>([]);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
    }, []);
    
    useEffect(() => {
        if (!token) return;

        const fetchPdcas = async () => {
            try {
                const res = await fetch("http://localhost:8000/dailytracks/pdca/list/", {
                    headers: {
                        "Authorization": `Token ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setPdcas(data);
                } else {
                    throw new Error('日記の取得に失敗しました');
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchPdcas();
    }, [token]);
    console.log(pdcas);

    return (
        <div className="p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#00004d] mb-4">
                {logged_user ? `${logged_user.username} さんのPDCAレポート` : "PDCAレポート"}
            </h1>
            <p className="text-lg text-gray-600">あなたのPDCAをここに残しましょう</p>

            <div className="flex justify-center mb-8">
                <button
                    className="bg-[#00004d] text-white px-6 py-3 rounded hover:bg-[#ff0000] transition w-fit"
                    onClick={() => router.push('/pdca_report/create')}
                >
                    新しいPDCAレポートを作成
                </button>
            </div>

            {pdcas.length === 0 ? (
                <p className="text-center text-gray-500">まだPDCAレポートがありません。</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pdcas.map((pdca) => (
                        <div
                            key={pdca.id}
                            className="relative border rounded-xl p-5 shadow-md hover:shadow-lg transition bg-white text-left"
                        >
                            {/* 編集ボタン */}
                            <button
                                className="absolute top-3 right-3 text-sm text-white bg-[#00004d] hover:bg-[#ff0000] px-4 py-2 rounded transition"
                                onClick={() => router.push(`/pdca_report/edit/${pdca.id}`)}
                            >
                                編集
                            </button>
                            <p className="text-sm font-semibold text-[#ff0000] mb-2">
                                {pdca.week_date}の週
                            </p>

                            <div className="mb-3">
                                <h3 className="font-bold text-[#00004d]">Plan（計画）</h3>
                                <p className="whitespace-pre-wrap text-gray-800 mt-1">{pdca.plan}</p>
                            </div>

                            <div className="mb-3">
                                <h3 className="font-bold text-[#00004d]">Do（実行）</h3>
                                <p className="whitespace-pre-wrap text-gray-800 mt-1">{pdca.execution}</p>
                            </div>

                            <div className="mb-3">
                                <h3 className="font-bold text-[#00004d]">Check（評価）</h3>
                                <p className="whitespace-pre-wrap text-gray-800 mt-1">{pdca.review}</p>
                            </div>

                            <div className="mb-3">
                                <h3 className="font-bold text-[#00004d]">Action（改善）</h3>
                                <p className="whitespace-pre-wrap text-gray-800 mt-1">{pdca.action}</p>
                            </div>

                            <div className="mb-3">
                                <h3 className="font-bold text-[#00004d]">Feedback</h3>
                                {pdca.feedback ? (
                                    <p className="whitespace-pre-wrap text-gray-800 mt-1">{pdca.feedback}</p>
                                ) : (
                                    <p className="text-red-600 mt-1">未記入</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}