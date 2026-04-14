"use client";

import { useState } from "react";

export default function Home() {
    const [result, setResult] = useState<any>(null);

    const handleExecute = async () => {
        const res = await fetch("http://localhost:3001/intent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                goal: "maximize_profit",
                amount: 1000
            })
        });

        const data = await res.json();
        setResult(data);
    };

    return (
        <div style={{ padding: "20px" }}>
            <button onClick={handleExecute}>Execute</button>

            {result && (
                <div>
                    <h3>Strategy:</h3>
                    {result.steps.map((step: string, i: number) => (
                        <p key={i}>{step}</p>
                    ))}
                </div>
            )}
        </div>
    );
}