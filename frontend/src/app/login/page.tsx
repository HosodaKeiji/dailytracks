// frontend/src/app/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch('http://localhost:8000/accounts/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            router.push('/home');
        } else {
            const errorText =
                data.non_field_errors?.[0] ||
                data.detail || // 認証失敗のときにDjango RESTが返す標準
                Object.values(data).flat()[0] ||
                '不明なエラー';
            alert(errorText);
        }

    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <form
                onSubmit={handleLogin}
                className="bg-white shadow-md rounded-lg p-8 w-full max-w-md border border-[#00004d]"
            >
                <h1 className="text-3xl font-bold mb-6 text-[#ff0000] text-center">ログイン</h1>

                <label className="block mb-2 text-sm font-semibold text-[#00004d]" htmlFor="username">
                ユーザー名
                </label>
                <input
                id="username"
                type="text"
                placeholder="ユーザー名を入力"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 mb-4 border border-[#00004d] rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                />

                <label className="block mb-2 text-sm font-semibold text-[#00004d]" htmlFor="password">
                パスワード
                </label>
                <input
                id="password"
                type="password"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mb-6 border border[#00004d] rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                />

                <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-md transition-colors duration-300"
                >
                ログイン
                </button>
            </form>
        </div>
    );
}
