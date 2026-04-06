import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();

        const ollamaUrl = process.env.OLLAMA_URL;

        if (!ollamaUrl) {
            throw new Error("Variable OLLAMA_URL no configurada en el entorno");
        }

        const response = await fetch(ollamaUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: process.env.OLLAMA_MODEL,
                prompt: prompt,
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            return NextResponse.json({ error: "Ollama Error", details: errorData }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ response: data.response });

    } catch (error: any) {
        console.error("❌ Fallo en el Router:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}