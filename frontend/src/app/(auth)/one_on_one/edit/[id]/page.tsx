'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type OneOnOne = {
    id: number;
    date: string;
    consultation: string;
    last_action: string;
    feedback: string;
    next_action: string;
}

export default function OneOnOneEditPage() {
    const { id } = useParams();
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [oneOnOne, setOneOnOne] = useState<OneOnOne | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
    }, []);

    useEffect(() => {
        if (!token || !id) return;

        const fetchOneOnOne = async () => {
            const res = await fetch(`http://localhost:8000/dailytracks/one_on_one/${id}/`, {
                headers: {
                    "Authorization": `Token ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setOneOnOne(data);
            } else {
                alert('1on1の取得に失敗しました');
                router.push('/one_on_one');
            }
        };

        fetchOneOnOne();
    }, [token, id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!oneOnOne) return;
        setOneOnOne({ ...oneOnOne, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oneOnOne || !token) return;

        const res = await fetch(`http://localhost:8000/dailytracks/one_on_one/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
        },
        body: JSON.stringify(oneOnOne),
        });

        if (res.ok) {
        alert('1on1を更新しました');
        router.push('/one_on_one');
        } else {
        alert('更新に失敗しました');
        }
    };

    if (oneOnOne === null) {
        return <p className="text-center mt-10">読み込み中...</p>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-[#00004d] mb-6">1on1編集</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                <label className="block font-semibold text-[#00004d]">Consultation（相談内容）</label>
                <textarea
                    name="consultation"
                    value={oneOnOne.consultation}
                    onChange={handleChange}
                    className="w-full border p-3 rounded"
                    rows={4}
                />
                </div>

                <div>
                <label className="block font-semibold text-[#00004d]">LastAction（前回から行動したこと）</label>
                <textarea
                    name="last_action"
                    value={oneOnOne.last_action}
                    onChange={handleChange}
                    className="w-full border p-3 rounded"
                    rows={4}
                />
                </div>

                <div>
                <label className="block font-semibold text-[#00004d]">Feedback</label>
                <textarea
                    name="feedback"
                    value={oneOnOne.feedback}
                    onChange={handleChange}
                    className="w-full border p-3 rounded"
                    rows={4}
                />
                </div>

                <div>
                <label className="block font-semibold text-[#00004d]">NextAction（次の行動）</label>
                <textarea
                    name="next_action"
                    value={oneOnOne.next_action}
                    onChange={handleChange}
                    className="w-full border p-3 rounded"
                    rows={4}
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
                onClick={() => router.push('/one_on_one')}
                className="bg-[#00004d] text-white px-4 py-2 text-sm rounded hover:bg-[#ff0000] hover:text-white transition"
            >
                戻る
            </button>
        </div>
    );
}