'use client';
import { useGetLoggedUser } from '@/hooks/getLoginUser';

export default function SettingsPage() {
    const logged_user = useGetLoggedUser();

    return (
        <div className="p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#00004d] mb-4">
                {logged_user ? `${logged_user.username} さんの目標設定` : "目標設定"}
            </h1>
            <p className="text-lg text-gray-600">あなたの目標設定をここに残しましょう</p>
        </div>
    );
}