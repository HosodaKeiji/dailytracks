'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OneOnOnePage() {
    const router = useRouter();
    const [date, setDate] = useState("");
    const [consultation, setConsultation] = useState("");
    const [lastAction, setLastAction] = useState("");
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // トークン取得
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            alert("ログイン情報がありません")
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/dailytracks/one_on_one/create/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
                body: JSON.stringify({ date, consultation, last_action: lastAction }),
            });

            if (res.ok) {
                alert("1on1を作成しました");
                router.push("/one_on_one");
            } else {
                const errorData = await res.json();
                alert("1on1の作成に失敗しました: " + JSON.stringify(errorData));
            }
        } catch (error) {
            alert("エラーが発生しました");
            console.error(error);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-8">
            <h1 className="text-3xl text-center font-bold mb-6 text-[#00004d]">新しい1on1を作成</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 日付の指定 */}
                <div>
                    <label htmlFor="week_date" className="block font-semibold mb-2 text-[#00004d]">
                        1on1実施日
                    </label>
                    <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00004d] transition"
                        required
                    />
                </div>
                {/* 内容入力 */}
                <div>
                    <label htmlFor="content" className="block font-semibold mb-2 text-[#00004d]">Consultation</label>
                    <textarea
                        id="content"
                        rows={6}
                        maxLength={1000}
                        value={consultation}
                        onChange={e => setConsultation(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00004d] transition"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="content" className="block font-semibold mb-2 text-[#00004d]">LastAction</label>
                    <textarea
                        id="content"
                        rows={6}
                        maxLength={1000}
                        value={lastAction}
                        onChange={e => setLastAction(e.target.value)}
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
                onClick={() => router.push('/one_on_one')}
                className="bg-[#00004d] text-white px-4 py-2 text-sm rounded hover:bg-[#ff0000] hover:text-white transition"
            >
                戻る
            </button>
        </div>
    );
}