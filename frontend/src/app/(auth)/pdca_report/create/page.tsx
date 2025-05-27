'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DiaryCreatePage() {
    const router = useRouter();
    const [weekDate, setWeekDate] = useState("");
    const [plan, setPlan] = useState("");
    const [execution, setExecution] = useState("");
    const [review, setReview] = useState("");
    const [action, setAction] = useState("");
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // トークン取得
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            alert("ログイン情報がありません");
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/dailytracks/pdca/create/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
                body: JSON.stringify({ week_date: weekDate, plan, execution, review, action }),
            });

            if (res.ok) {
                alert("PDCAレポートを作成しました");
                router.push("/pdca_report");
            } else {
                const errorData = await res.json();
                alert("PDCAレポートの作成に失敗しました: " + JSON.stringify(errorData));
            }
        } catch (error) {
            alert("エラーが発生しました");
            console.error(error);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-8">
            <h1 className="text-3xl text-center font-bold mb-6 text-[#00004d]">新しい日記を作成</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 日付の指定 */}
                <div>
                    <label htmlFor="week_date" className="block font-semibold mb-2 text-[#00004d]">
                        週の開始日
                    </label>
                    <input
                        type="date"
                        id="week_date"
                        value={weekDate}
                        onChange={(e) => setWeekDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00004d] transition"
                        required
                    />
                </div>
                {/* 内容入力 */}
                <div>
                    <label htmlFor="content" className="block font-semibold mb-2 text-[#00004d]">Plan（計画）</label>
                    <textarea
                        id="content"
                        rows={6}
                        maxLength={1000}
                        value={plan}
                        onChange={e => setPlan(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00004d] transition"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="content" className="block font-semibold mb-2 text-[#00004d]">Do（実行）</label>
                    <textarea
                        id="content"
                        rows={6}
                        maxLength={1000}
                        value={execution}
                        onChange={e => setExecution(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00004d] transition"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="content" className="block font-semibold mb-2 text-[#00004d]">Check（評価）</label>
                    <textarea
                        id="content"
                        rows={6}
                        maxLength={1000}
                        value={review}
                        onChange={e => setReview(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00004d] transition"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="content" className="block font-semibold mb-2 text-[#00004d]">Action（改善）</label>
                    <textarea
                        id="content"
                        rows={6}
                        maxLength={1000}
                        value={action}
                        onChange={e => setAction(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00004d] transition"
                        required
                    />
                </div>

                {/* 送信ボタン */}
                <div className="text-center">
                    <button
                        type="submit"
                        className="bg-[#00004d] text-white px-6 py-3 rounded hover:bg-[#ff0000] transition mx-auto"
                    >
                        作成する
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
