'use client';
import { useGetLoggedUser } from '@/hooks/getLoginUser';

export default function SettingsPage() {
    const logged_user = useGetLoggedUser();

    return (
        <div className="p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#00004d] mb-4">
                {logged_user ? `${logged_user.username} さんの日記` : "日記"}
            </h1>
            <p className="text-lg text-gray-600">あなたの日記をここに残しましょう</p>
        </div>
    );return (
        <div>
            <h1 className="text-2xl font-bold text-[#ff0000]">日記</h1>
        </div>
    );
}