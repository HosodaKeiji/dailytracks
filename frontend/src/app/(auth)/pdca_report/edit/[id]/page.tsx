'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

type Pdca = {
    id: number;
    week_date: string;
    plan: string;
    execution: string;
    review: string;
    action: string;
    feedback: string;
};

export default function PdcaEditPage() {
    const { id } = useParams();
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [pdca, setPdca] = useState<Pdca | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
    }, []);

    useEffect(() => {
        if (!token || !id) return;

        const fetchPdca = async () => {
            const res = await fetch(`http://localhost:8000/dailytracks/pdca/${id}/`, {
                headers: {
                    "Authorization": `Token ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setPdca(data);
            } else {
                alert('PDCAレポートの取得に失敗しました');
                router.push('/pdca_report');
            }
        };

        fetchPdca();
    }, [token, id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!pdca) return;
        setPdca({ ...pdca, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pdca || !token) return;

        const res = await fetch(`http://localhost:8000/dailytracks/pdca/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
        },
        body: JSON.stringify(pdca),
        });

        if (res.ok) {
        alert('PDCAレポートを更新しました');
        router.push('/pdca_report');
        } else {
        alert('更新に失敗しました');
        }
    };

    if (pdca === null) {
        return <LoadingSpinner />;
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-[#00004d] mb-6 text-center">PDCAレポート編集</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                <label className="block font-semibold text-[#00004d]">Plan（計画）</label>
                <textarea
                    name="plan"
                    value={pdca.plan}
                    onChange={handleChange}
                    className="w-full border p-3 rounded"
                    rows={4}
                />
                </div>

                <div>
                <label className="block font-semibold text-[#00004d]">Do（実行）</label>
                <textarea
                    name="execution"
                    value={pdca.execution}
                    onChange={handleChange}
                    className="w-full border p-3 rounded"
                    rows={4}
                />
                </div>

                <div>
                <label className="block font-semibold text-[#00004d]">Check（評価）</label>
                <textarea
                    name="review"
                    value={pdca.review}
                    onChange={handleChange}
                    className="w-full border p-3 rounded"
                    rows={4}
                />
                </div>

                <div>
                <label className="block font-semibold text-[#00004d]">Action（改善）</label>
                <textarea
                    name="action"
                    value={pdca.action}
                    onChange={handleChange}
                    className="w-full border p-3 rounded"
                    rows={4}
                />
                </div>

                <div>
                <label className="block font-semibold text-[#00004d]">Feedback</label>
                <textarea
                    name="feedback"
                    value={pdca.feedback}
                    onChange={handleChange}
                    className="w-full border p-3 rounded"
                    rows={3}
                />
                </div>

                {/* 送信ボタン */}
                <div className="text-center">
                    <button
                        type="submit"
                        className="bg-[#00004d] text-white px-6 py-3 rounded hover:bg-[#ff0000] transition mx-auto"
                    >
                        更新する
                    </button>
                </div>
            </form>
            <button
                type="button"
                onClick={() => router.push('/pdca_report')}
                className="bg-[#00004d] text-white px-4 py-2 text-sm rounded hover:bg-[#ff0000] hover:text-white transition"
            >
                戻る
            </button>
        </div>
    );
}
