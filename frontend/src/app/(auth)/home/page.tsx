'use client'
import { useGetLoggedUser } from '@/hooks/getLoginUser';

export default function HomePage() {
    const logged_user = useGetLoggedUser();

    return (
        <div className="p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#00004d] mb-4">
                {logged_user ? `${logged_user.username} さんの日々の軌跡` : "ホーム"}
            </h1>
            <p className="text-lg text-gray-600">あなたの足跡をここに残しましょう</p>
        </div>
    );
}
