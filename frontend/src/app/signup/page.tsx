// frontend/src/app/signup/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        const res = await fetch('http://localhost:8000/api/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (res.ok) {
        alert('ユーザー登録しました');
        router.push('/login')
        } else {
        console.error('Error:', data);
        alert('ユーザー登録に失敗しました');
        }
    };

    return (
        <div>
        <h1>サインアップ</h1>
        <input placeholder="ユーザー名" value={username} onChange={(e) => setUsername(e.target.value)} /><br />
        <input type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} /><br />
        <button onClick={handleSignup}>登録</button>
        </div>
    );
}
