'use client';
import { useRouter } from 'next/navigation';
import { useGetLoggedUser } from '@/hooks/getLoginUser';

export default function SettingsPage() {
    const logged_user = useGetLoggedUser();
    const router = useRouter()

    return (
        <div className="p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#00004d] mb-4">
                {logged_user ? `${logged_user.username} さんの日記` : "日記"}
            </h1>
            <p className="text-lg text-gray-600 mb-6">あなたの日記をここに残しましょう</p>
            <button
                className="bg-[#00004d] text-white px-6 py-3 rounded hover:bg-[#ff0000] transition"
                onClick={() => router.push('/diary/create')}
            >
                新しい日記を作成
            </button>
        </div>
    );
}