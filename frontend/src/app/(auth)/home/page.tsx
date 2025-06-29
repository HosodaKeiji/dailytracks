'use client'
import { useEffect, useState } from 'react';
import { useGetLoggedUser } from '@/hooks/getLoginUser';
import LoadingSpinner from '@/components/LoadingSpinner';

type Diary = {
    id: number;
    content: string;
    mood: number;
    created_at: string;
};

const moodLabels: Record<number, string> = {
        1: "絶好調",
        2: "良好",
        3: "普通",
        4: "不調",
        5: "絶不調",
    };

type Pdca = {
    id: number;
    week_date: string;
    plan: string;
    execution: string;
    review: string;
    action: string;
    feedback: string;
}

type OneOnOne = {
    id: number;
    date: string;
    consultation: string;
    last_action: string;
    feedback: string;
    next_action: string;
}

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


export default function HomePage() {
    const logged_user = useGetLoggedUser();
    const [latestDiary, setLatestDiary] = useState<Diary | null>(null);
    const [latestPdca, setLatestPdca] = useState<Pdca | null>(null);
    const [latestOneOnOne, setLatestOneOnOne] = useState<OneOnOne | null>(null);
    const [latestGoalSetting, setLatestGoalSetting] = useState<GoalSetting | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const [isDiaryLoaded, setIsDiaryLoaded] = useState(false);
    const [isPdcaLoaded, setIsPdcaLoaded] = useState(false);
    const [isOneOnOneLoaded, setIsOneOnOneLoaded] = useState(false);
    const [isGoalSettingLoaded, setIsGoalSettingLoaded] = useState(false);
    const isAllLoaded = isDiaryLoaded && isPdcaLoaded && isOneOnOneLoaded && isGoalSettingLoaded;

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
    }, []);

    useEffect(() => {
        if (!token) return;

        const fetchLatestDiary = async () => {
            try {
                const res = await fetch("http://localhost:8000/dailytracks/diary/latest/", {
                    headers: {
                        "Authorization": `Token ${token}`,
                    },
                });

                if (res.status === 404) {
                    // データが存在しないだけなのでエラーにしない
                    setLatestDiary(null);
                } else if (res.ok) {
                    const data = await res.json();
                    setLatestDiary(data);
                } else {
                    throw new Error('最新の日記の取得に失敗しました');
                }
                setIsDiaryLoaded(true);
            } catch (error){
                console.error(error);
            }
        };

        fetchLatestDiary();
    }, [token]);

    useEffect(() => {
        if (!token) return;

        const fetchLatestPdca = async () => {
            try {
                const res = await fetch("http://localhost:8000/dailytracks/pdca/latest/", {
                    headers: {
                        "Authorization": `Token ${token}`,
                    },
                });

                if (res.status === 404) {
                    // データが存在しないだけなのでエラーにしない
                    setLatestPdca(null);
                } else if (res.ok) {
                    const data = await res.json();
                    setLatestPdca(data);
                } else {
                    throw new Error('最新のPDCAレポートの取得に失敗しました');
                }
                setIsPdcaLoaded(true);
            } catch (error){
                console.error(error);
            }
        };

        fetchLatestPdca();
    }, [token]);

    useEffect(() => {
        if (!token) return;

        const fetchLatestOneOnOne = async () => {
            try {
                const res = await fetch("http://localhost:8000/dailytracks/one_on_one/latest/", {
                    headers: {
                        "Authorization": `Token ${token}`,
                    },
                });

                if (res.status === 404) {
                    // データが存在しないだけなのでエラーにしない
                    setLatestOneOnOne(null);
                } else if (res.ok) {
                    const data = await res.json();
                    setLatestOneOnOne(data);
                } else {
                    throw new Error('最新の1on1の取得に失敗しました');
                }
                setIsOneOnOneLoaded(true);
            } catch (error){
                console.error(error);
            }
        };

        fetchLatestOneOnOne();
    }, [token]);

    useEffect(() => {
        if (!token) return;

        const fetchLatestGoalSetting = async () => {
            try {
                const res = await fetch("http://localhost:8000/dailytracks/goal_setting/latest/", {
                    headers: {
                        "Authorization": `Token ${token}`,
                    },
                });

                if (res.status === 404) {
                    // データが存在しないだけなのでエラーにしない
                    setLatestGoalSetting(null);
                } else if (res.ok) {
                    const data = await res.json();
                    setLatestGoalSetting(data);
                } else {
                    throw new Error('最新の目標設定の取得に失敗しました');
                }
                setIsGoalSettingLoaded(true);
            } catch (error){
                console.error(error);
            }
        };

        fetchLatestGoalSetting();
    }, [token]);

    if (!isAllLoaded) {
        return <LoadingSpinner />;
    }

    return (
    <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-[#00004d] text-center mb-2">
            {logged_user ? `${logged_user.username} さんの日々の軌跡` : "ホーム"}
        </h1>
        <p className="text-lg text-gray-600 text-center mb-10">
            あなたの足跡をここに残しましょう
        </p>

        {/* 日記セクション */}
        <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-semibold text-[#00004d] mb-4 flex items-center gap-2">
                <span>最新の日記</span>
            </h2>

            {latestDiary ? (
                <div className="border rounded-xl p-5 shadow-md hover:shadow-lg transition bg-white">
                    <p className="text-sm text-[#00004d] mb-1">{latestDiary.created_at}</p>
                    <p className="font-semibold text-[#00004d]">気分: {moodLabels[latestDiary.mood]}</p>
                    <p className="mt-3 whitespace-pre-wrap">{latestDiary.content}</p>
                </div>
            ) : (
                <p className="text-gray-500">まだ日記がありません。</p>
            )}
        </section>

        {/* PDCAレポートセクション */}
        <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-semibold text-[#00004d] mb-4 flex items-center gap-2">
                <span>最新のPDCAレポート</span>
            </h2>

            {latestPdca ? (
                <div className="relative border rounded-xl p-5 shadow-md hover:shadow-lg transition bg-white text-left">
                    <p className="text-sm font-semibold text-[#ff0000] mb-2">
                        {latestPdca.week_date}の週
                    </p>

                    <div className="mb-3">
                        <h3 className="font-bold text-[#00004d]">Plan（計画）</h3>
                        <p className="whitespace-pre-wrap text-gray-800 mt-1">{latestPdca.plan}</p>
                    </div>

                    <div className="mb-3">
                        <h3 className="font-bold text-[#00004d]">Do（実行）</h3>
                        <p className="whitespace-pre-wrap text-gray-800 mt-1">{latestPdca.execution}</p>
                    </div>

                    <div className="mb-3">
                        <h3 className="font-bold text-[#00004d]">Check（評価）</h3>
                        {latestPdca.review ? (
                            <p className="whitespace-pre-wrap text-gray-800 mt-1">{latestPdca.review}</p>
                        ) : (
                            <p className="text-red-600 mt-1">未記入</p>
                        )}
                    </div>

                    <div className="mb-3">
                        <h3 className="font-bold text-[#00004d]">Action（改善）</h3>
                        {latestPdca.action ? (
                            <p className="whitespace-pre-wrap text-gray-800 mt-1">{latestPdca.action}</p>
                        ) : (
                            <p className="text-red-600 mt-1">未記入</p>
                        )}
                    </div>

                    <div className="mb-3">
                        <h3 className="font-bold text-[#00004d]">Feedback</h3>
                        {latestPdca.feedback ? (
                            <p className="whitespace-pre-wrap text-gray-800 mt-1">{latestPdca.feedback}</p>
                        ) : (
                            <p className="text-red-600 mt-1">未記入</p>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-gray-500">まだPDCAレポートがありません。</p>
            )}
        </section>

        {/* 1on1セクション */}
        <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-semibold text-[#00004d] mb-4 flex items-center gap-2">
                <span>最新の1on1</span>
            </h2>

            {latestOneOnOne ? (
                <div className="relative border rounded-xl p-5 shadow-md hover:shadow-lg transition bg-white text-left">
                    <p className="text-sm font-semibold text-[#ff0000] mb-2">
                        実施日：{latestOneOnOne.date}
                    </p>

                    <div className="mb-3">
                        <h3 className="font-bold text-[#00004d]">Consultation（相談内容）</h3>
                        <p className="whitespace-pre-wrap text-gray-800 mt-1">{latestOneOnOne.consultation}</p>
                    </div>

                    <div className="mb-3">
                        <h3 className="font-bold text-[#00004d]">LastAction（前回から行動したこと）</h3>
                        <p className="whitespace-pre-wrap text-gray-800 mt-1">{latestOneOnOne.last_action}</p>
                    </div>

                    <div className="mb-3">
                        <h3 className="font-bold text-[#00004d]">Feedback</h3>
                        {latestOneOnOne.feedback ? (
                            <p className="whitespace-pre-wrap text-gray-800 mt-1">{latestOneOnOne.feedback}</p>
                        ) : (
                            <p className="text-red-600 mt-1">未記入</p>
                        )}
                    </div>

                    <div className="mb-3">
                        <h3 className="font-bold text-[#00004d]">NextAction（次の行動）</h3>
                        {latestOneOnOne.feedback ? (
                            <p className="whitespace-pre-wrap text-gray-800 mt-1">{latestOneOnOne.next_action}</p>
                        ) : (
                            <p className="text-red-600 mt-1">未記入</p>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-gray-500">まだ1on1がありません。</p>
            )}
        </section>

        {/* 目標設定セクション */}
        <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-semibold text-[#00004d] mb-4 flex items-center gap-2">
                <span>最新の目標設定</span>
            </h2>

            {latestGoalSetting ? (
                <div className="border rounded-xl p-5 shadow-md hover:shadow-lg transition bg-white">
                    <p className="text-sm font-semibold text-[#ff0000] mt-3 mb-3">
                        対象月：{latestGoalSetting.month}
                    </p>

                    {latestGoalSetting.goal_actions.length === 0 ? (
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
                                {latestGoalSetting.goal_actions.map((ga, index) => (
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
            ) : (
                <p className="text-gray-500">まだ日記がありません。</p>
            )}
        </section>
    </div>
);

}
