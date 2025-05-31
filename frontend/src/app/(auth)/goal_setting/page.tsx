'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGetLoggedUser } from '@/hooks/getLoginUser';
import LoadingSpinner from '@/components/LoadingSpinner';

type GoalAction = {
    id: number;
    goal: string;
    action: string;
    goal_setting: number;
    result: string;
    feedback: string;
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
    const [loading, setLoading] = useState(true);

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
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        };

        fetchGoalSettings();
    }, [token]);

    if (loading) {
        return <LoadingSpinner />;
    }

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
                <div className="grid grid-cols-1 gap-6">
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

                            <p className="text-sm font-semibold text-[#ff0000] mt-3 mb-3">
                                対象月：{goalSetting.month}
                            </p>

                            {goalSetting.goal_actions.length === 0 ? (
                                <p className="text-gray-500">この月の目標設定はまだありません。</p>
                            ) : (
                                <table className="w-full table-auto border border-gray-300 text-sm mt-2">
                                    <thead className="bg-gray-100 text-[#00004d]">
                                        <tr>
                                            <th className="border border-[#00004d] px-4 py-2">#</th>
                                            <th className="border border-[#00004d] px-4 py-2">目標</th>
                                            <th className="border border-[#00004d] px-4 py-2">取り組み</th>
                                            <th className="border border-[#00004d] px-4 py-2">結果</th>
                                            <th className="border border-[#00004d] px-4 py-2">フィードバック</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {goalSetting.goal_actions.map((ga, index) => (
                                            <tr key={ga.id} className="text-gray-800">
                                            <td className="border border-[#00004d] px-4 py-2 text-center">{index + 1}</td>
                                            <td className="border border-[#00004d] px-4 py-2 whitespace-pre-wrap">{ga.goal}</td>
                                            <td className="border border-[#00004d] px-4 py-2 whitespace-pre-wrap">{ga.action}</td>

                                            <td className="border border-[#00004d] px-4 py-2 whitespace-pre-wrap">
                                                {ga.result ? (
                                                ga.result
                                                ) : (
                                                <span className="text-red-600">未記入</span>
                                                )}
                                            </td>

                                            <td className="border border-[#00004d] px-4 py-2 whitespace-pre-wrap">
                                                {ga.feedback ? (
                                                ga.feedback
                                                ) : (
                                                <span className="text-red-600">未記入</span>
                                                )}
                                            </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}