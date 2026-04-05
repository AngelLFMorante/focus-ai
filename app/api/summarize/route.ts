import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();

        const response = await fetch("http://192.168.1.152:11434/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "qwen3.5:9b",
                prompt: prompt,
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: "Error en Ollama", details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json({ response: data.response });
    } catch (error) {
        console.error("Error en API summarize:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
