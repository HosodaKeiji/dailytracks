'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState<string | null>(null);
    
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
    }, []);

    const handleUsernameChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            alert("ログイン情報がありません");
            return;
        }
        
        const res = await fetch("http://localhost:8000/accounts/change-username/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Token ${token}`,
            },
            credentials: "include",
            body: JSON.stringify({ username }),
        });

        const data = await res.json();
        if (res.ok) {
            alert("ユーザー名を変更しました");
            setUsername(""); // 入力欄クリア（任意）
        } else {
            alert(`ユーザー名変更に失敗しました:${data.error}`);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        const res = await fetch('http://localhost:8000/accounts/change-password/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({ password }),
        });

        const data = await res.json();
        if (res.ok) {
            alert("パスワードを変更しました");
            setPassword(""); // 入力欄クリア（任意）
        } else {
            alert(`パスワード変更に失敗しました:${data.error}`);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-10 px-6">
            <h1 className="text-2xl font-bold text-[#00004d] mb-6">設定</h1>

            {/* ユーザー名変更フォーム */}
            <form onSubmit={handleUsernameChange} className="mb-8 space-y-4">
                <h2 className="text-xl font-semibold text-[#00004d]">ユーザー名変更</h2>
                <input
                    type="text"
                    placeholder="新しいユーザー名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-[#00004d] rounded-md px-4 py-2"
                    required
                />
                <button
                    type="submit"
                    className="bg-[#ff0000] text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                    ユーザー名を変更
                </button>
            </form>

            {/* パスワード変更フォーム */}
            <form onSubmit={handlePasswordChange} className="space-y-4">
                <h2 className="text-xl font-semibold text-[#00004d]">パスワード変更</h2>
                <input
                    type="password"
                    placeholder="新しいパスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-[#00004d] rounded-md px-4 py-2"
                    required
                />
                <button
                    type="submit"
                    className="bg-[#ff0000] text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                    パスワードを変更
                </button>
            </form>

            {/* ホームに戻るボタン */}
            <div className="mt-10">
                <button
                    onClick={() => router.push('/home')}
                    className="text-[#00004d] underline hover:text-red-700 transition"
                >
                    ホームに戻る
                </button>
            </div>
        </div>
    );
}
