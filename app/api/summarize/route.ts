import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 110;

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();

        const ollamaUrl = process.env.OLLAMA_URL;
        const model = process.env.OLLAMA_MODEL;

        if (!ollamaUrl) throw new Error("OLLAMA_URL no configurada");
        if (!model) throw new Error("OLLAMA_MODEL no configurado");

        const response = await fetch(ollamaUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: model,
                prompt,
                stream: false,
            }),
        });

        if (!response.ok) {
            const rawText = await response.text();
        
            let details;
            try {
                details = JSON.parse(rawText);
            } catch {
                details = rawText;
            }
        
            return NextResponse.json(
                { error: "Ollama Error", details },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json({ response: data.response });

    } catch (error: any) {
        console.error("❌ Fallo en el Router:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
