import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

describe("API Route /api/summarize", () => {
    beforeEach(() => {
        // Forzamos la variable de entorno exacta de tu PC de sobremesa
        vi.stubEnv("OLLAMA_URL", "http://192.168.1.152:11434/api/generate");

        // Limpiamos el fetch global para cada test
        global.fetch = vi.fn();
    });

    it("debe devolver el resumen cuando Ollama (Windows) responde 200", async () => {
        // Simulamos la respuesta exitosa de tu Ollama local
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ response: "Resumen generado en Windows." }),
        });

        const request = new NextRequest("http://localhost:3000/api/summarize", {
            method: "POST",
            body: JSON.stringify({ prompt: "Texto para el PC de sobremesa" }),
        });

        const result = await POST(request);
        const data = await result.json();

        expect(result.status).toBe(200);
        expect(data).toEqual({ response: "Resumen generado en Windows." });

        // Verificamos que el fetch se hizo a la IP correcta
        expect(global.fetch).toHaveBeenCalledWith(
            "http://192.168.1.152:11434/api/generate",
            expect.any(Object)
        );
    });

    it("debe propagar el error si la IP de Windows no responde (500)", async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 500,
            text: async () => "Ollama is busy or offline",
        });

        const request = new NextRequest("http://localhost:3000/api/summarize", {
            method: "POST",
            body: JSON.stringify({ prompt: "Test de error" }),
        });

        const result = await POST(request);
        const data = await result.json();

        expect(result.status).toBe(500);
        expect(data.error).toBe("Ollama Error");
    });
});