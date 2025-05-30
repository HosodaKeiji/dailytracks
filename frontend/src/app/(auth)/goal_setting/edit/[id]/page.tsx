'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type GoalAction = {
    id: number;
    goal: string;
    action: string;
    result: string;
    feedback: string;
    goal_setting: number;
};

type GoalSetting = {
    id: number;
    month: string;
    goal_actions: GoalAction[];
};

export default function GoalSettingEditPage() {
    const { id } = useParams();
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [goalSetting, setGoalSetting] = useState<GoalSetting | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
    }, []);

    useEffect(() => {
        if (!token || !id) return;

        const fetchGoalSetting = async () => {
            const res = await fetch(`http://localhost:8000/dailytracks/goal_setting/${id}/`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setGoalSetting(data);
            } else {
                alert("目標設定の取得に失敗しました");
                router.push('/goal_setting');
            }
        };

        fetchGoalSetting();
    }, [token, id, router]);

    const handleChange = (index: number, field: keyof GoalAction, value: string) => {
        if (!goalSetting) return;

        const updatedActions = [...goalSetting.goal_actions];
        updatedActions[index] = { ...updatedActions[index], [field]: value };

        setGoalSetting({ ...goalSetting, goal_actions: updatedActions });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goalSetting || !token) return;

        const res = await fetch(`http://localhost:8000/dailytracks/goal_setting/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(goalSetting),
        });

        if (res.ok) {
            alert("目標設定を更新しました");
            router.push('/goal_setting');
        } else {
            alert("更新に失敗しました");
        }
    };

    if (goalSetting === null) {
        return <p className="text-center mt-10">読み込み中...</p>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-[#00004d] mb-6 text-center">目標設定編集</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {goalSetting.goal_actions.map((action, index) => (
                    <div key={action.id} className=" pt-4 mt-4 space-y-3">
                        <h2 className="text-xl font-semibold text-[#00004d]">目標 {index + 1}</h2>

                        <div>
                            <label className="block text-[#00004d]">目標</label>
                            <textarea
                                className="w-full border p-2 rounded"
                                value={action.goal}
                                onChange={(e) => handleChange(index, 'goal', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-[#00004d]">取り組み</label>
                            <textarea
                                className="w-full border p-2 rounded"
                                value={action.action}
                                onChange={(e) => handleChange(index, 'action', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-[#00004d]">結果</label>
                            <textarea
                                className="w-full border p-2 rounded"
                                value={action.result || ''}
                                onChange={(e) => handleChange(index, 'result', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-[#00004d]">フィードバック</label>
                            <textarea
                                className="w-full border p-2 rounded"
                                value={action.feedback || ''}
                                onChange={(e) => handleChange(index, 'feedback', e.target.value)}
                            />
                        </div>
                    </div>
                ))}

                <div className="text-center mt-6">
                    <button
                        type="submit"
                        className="bg-[#00004d] text-white px-6 py-3 rounded hover:bg-[#ff0000] transition"
                    >
                        更新する
                    </button>
                </div>
            </form>

            <button
                type="button"
                onClick={() => router.push('/goal_setting')}
                className="mt-4 bg-[#00004d] text-white px-4 py-2 text-sm rounded hover:bg-[#ff0000] transition"
            >
                戻る
            </button>
        </div>
    );
}
