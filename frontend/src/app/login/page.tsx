// frontend/src/app/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const res = await fetch('http://localhost:8000/api/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (res.ok) {
            router.push('/home');
            localStorage.setItem('token', data.token);
        } else {
            setError(data.non_field_errors || '不明なエラー');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
        <form
            onSubmit={handleLogin}
            className="bg-white shadow-md rounded-lg p-8 w-full max-w-md border border-blue-900"
        >
            <h1 className="text-3xl font-bold mb-6 text-red-600 text-center">ログイン</h1>

            <label className="block mb-2 text-sm font-semibold text-blue-900" htmlFor="username">
            ユーザー名
            </label>
            <input
            id="username"
            type="text"
            placeholder="ユーザー名を入力"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-blue-900 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
            />

            <label className="block mb-2 text-sm font-semibold text-blue-900" htmlFor="password">
            パスワード
            </label>
            <input
            id="password"
            type="password"
            placeholder="パスワードを入力"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mb-6 border border-blue-900 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
            />

            <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-md transition-colors duration-300"
            >
            ログイン
            </button>

            {error && (
            <p className="mt-4 text-center text-red-500 font-semibold">
                {error}
            </p>
            )}
        </form>
        </div>
    );
}
