'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DiaryCreatePage() {
    const router = useRouter();
    const [content, setContent] = useState('');
    const [mood, setMood] = useState<number | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [today, setToday] = useState('');

    useEffect(() => {
        // トークン取得
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);

        // 日付取得
        const now = new Date();
        const mm = now.getMonth() + 1;
        const dd = now.getDate();
        setToday(`${mm}月${dd}日`);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            alert("ログイン情報がありません");
            return;
        }

        const confirm = window.confirm("日記は変更できませんが、作成してもよろしいですか？");
        if (!confirm) return;

        try {
            const res = await fetch("http://localhost:8000/dailytracks/diary/create/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
                body: JSON.stringify({ content, mood }),
            });

            if (res.ok) {
                alert("日記を作成しました");
                router.push("/diary");
            } else {
                const errorData = await res.json();
                alert("日記の作成に失敗しました: " + JSON.stringify(errorData));
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
                <div className="text-center text-sm font-semibold text-[#00004d] mb-4">
                    {today} の日記
                </div>

                {/* 気分選択 */}
                <div className="flex items-center space-x-4">
                    <label htmlFor="mood" className="w-24 font-semibold text-[#00004d]">
                        気分
                    </label>
                    <select
                        id="mood"
                        value={mood ?? ''}
                        onChange={(e) => setMood(Number(e.target.value))}
                        className="flex-1 p-3 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00004d] transition"
                        required
                    >
                        <option value="" disabled hidden>気分を選んでください</option>
                        <option value="1">絶好調</option>
                        <option value="2">良好</option>
                        <option value="3">普通</option>
                        <option value="4">不調</option>
                        <option value="5">絶不調</option>
                    </select>
                </div>

                {/* 内容入力 */}
                <div>
                    <label htmlFor="content" className="block font-semibold mb-2 text-[#00004d]">内容</label>
                    <textarea
                        id="content"
                        rows={6}
                        maxLength={1000}
                        value={content}
                        onChange={e => setContent(e.target.value)}
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
                onClick={() => router.push('/diary')}
                className="bg-[#00004d] text-white px-4 py-2 text-sm rounded hover:bg-[#ff0000] hover:text-white transition"
            >
                戻る
            </button>
        </div>
    );
}
