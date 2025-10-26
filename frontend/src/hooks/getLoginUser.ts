import { useEffect, useState } from "react";

type User = {
    id: number;
    username: string;
    // 他に必要な項目があれば追加
};

export function useGetLoggedUser() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch("http://localhost:8000/dailytracks/user/me/", {
            headers: {
                Authorization: `Token ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setUser(data);
            })
            .catch((err) => console.error("ユーザー取得エラー:", err));
    }, []);

    return user;
}
