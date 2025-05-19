'use client'
import { useEffect, useState } from "react";

export default function HomePage() {
    const [username, setUsername] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch("http://localhost:8000/api/user/me/", {
            headers: {
                "Authorization": `Token ${token}`,
            },
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.username) {
                setUsername(data.username);
            }
        })
        .catch((err) => console.error("ユーザー取得エラー:", err));
    }, []);

    return (
        <div style={{ padding: '2rem' }}>
            <h1>{username ? `${username} さんの日々の軌跡` : "ホーム"}</h1>
            <p>ようこそ、ホーム画面へ。</p>
        </div>
    );
}
