'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type GoalAction = {
    goal: string;
    action: string;
};

export default function GoalSettingCreatePage() {
    const router = useRouter();
    const [month, setMonth] = useState("");
    const [goalActions, setGoalActions] = useState([{ goal: "", action: "" }]);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
    }, []);

    const handleChange = (index: number, field: keyof GoalAction, value: string) => {
        const updated = [...goalActions];
        updated[index][field] = value;
        setGoalActions(updated);
    };


    const addGoalActionPair = () => {
        setGoalActions([...goalActions, { goal: "", action: "" }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            alert("ログイン情報がありません");
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/dailytracks/goal_setting/create/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
                body: JSON.stringify({
                    month: `${month}-01`,
                    goal_actions: goalActions,
                }),
            });

            if (res.ok) {
                alert("目標設定を作成しました");
                router.push("/goal_setting");
            } else {
                const errorData = await res.json();
                alert("作成に失敗しました: " + JSON.stringify(errorData));
            }
        } catch (error) {
            alert("エラーが発生しました");
            console.error(error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-3xl text-center font-bold mb-6 text-[#00004d]">新しい目標設定を作成</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="month" className="block font-semibold mb-2 text-[#00004d]">
                        対象月
                    </label>
                    <input
                        type="month"
                        id="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00004d]"
                        required
                    />
                </div>

                {goalActions.map((pair, index) => (
                    <div key={index} className="p-4 border rounded space-y-4">
                        <div>
                            <label className="block font-semibold mb-2 text-[#00004d]">目標 {index + 1}</label>
                            <textarea
                                rows={3}
                                value={pair.goal}
                                onChange={(e) => handleChange(index, 'goal', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-2 text-[#00004d]">取り組み {index + 1}</label>
                            <textarea
                                rows={3}
                                value={pair.action}
                                onChange={(e) => handleChange(index, 'action', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                                required
                            />
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addGoalActionPair}
                    className="bg-[#00004d] text-white px-4 py-2 rounded hover:bg-[#ff0000]"
                >
                    目標を追加
                </button>

                <div className="text-center">
                    <button
                        type="submit"
                        className="bg-[#00004d] text-white px-6 py-3 rounded hover:bg-[#ff0000]"
                    >
                        作成する
                    </button>
                </div>
            </form>

            <div className="mt-4 text-center">
                <button
                    type="button"
                    onClick={() => router.push('/goal_setting')}
                    className="bg-[#00004d] text-white px-4 py-2 text-sm rounded hover:bg-[#ff0000] hover:text-white"
                >
                    戻る
                </button>
            </div>
        </div>
    );
}
