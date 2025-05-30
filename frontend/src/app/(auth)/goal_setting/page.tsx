'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGetLoggedUser } from '@/hooks/getLoginUser';
type GoalAction = {
    id: number;
    goal: string;
    action: string;
    goal_setting: number;
};

type GoalSetting = {
    id: number;
    month: string;
    goal_actions: GoalAction[];
};

export default function SettingsPage() {
    const logged_user = useGetLoggedUser();
    const router = useRouter();
    const [goalSettings, setGoalSettings] = useState<GoalSetting[]>([]);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
    }, []);

    useEffect(() => {
        if (!token) return;

        const fetchGoalSettings = async () => {
            try {
                const res = await fetch("http://localhost:8000/dailytracks/goal_setting/list/", {
                    headers: {
                        "Authorization": `Token ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setGoalSettings(data);
                } else {
                    throw new Error('目標設定の取得に失敗しました');
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchGoalSettings();
    }, [token]);
    console.log(goalSettings);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-[#00004d] mb-4 text-center">
                {logged_user ? `${logged_user.username} さんの目標設定` : "目標設定"}
            </h1>
            <p className="text-lg text-gray-600 mb-6 text-center">
                あなたの目標設定をここに残しましょう
            </p>

            <div className="flex justify-center mb-8">
                <button
                    className="bg-[#00004d] text-white px-6 py-3 rounded hover:bg-[#ff0000] transition w-fit"
                    onClick={() => router.push('/goal_setting/create')}
                >
                    新しい目標設定を作成
                </button>
            </div>

            {goalSettings.length === 0 ? (
                <p className="text-center text-gray-500">まだ目標設定がありません。</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {goalSettings.map((goalSetting) => (
                        <div
                            key={goalSetting.id}
                            className="relative border rounded-xl p-5 shadow-md hover:shadow-lg transition bg-white text-left"
                        >
                            <button
                                className="absolute top-3 right-3 text-sm text-white bg-[#00004d] hover:bg-[#ff0000] px-4 py-2 rounded transition"
                                onClick={() => router.push(`/goal_setting/edit/${goalSetting.id}`)}
                            >
                                編集
                            </button>

                            <p className="text-sm font-semibold text-[#ff0000] mb-3">
                                対象月：{goalSetting.month}
                            </p>

                            {goalSetting.goal_actions.map((ga, index) => (
                                <div key={ga.id} className="mb-4">
                                    <h3 className="font-bold text-[#00004d]">目標 {index + 1}</h3>
                                    <p className="whitespace-pre-wrap text-gray-800 mt-1 mb-2">{ga.goal}</p>

                                    <h3 className="font-bold text-[#00004d]">取り組み {index + 1}</h3>
                                    <p className="whitespace-pre-wrap text-gray-800 mt-1">{ga.action}</p>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}