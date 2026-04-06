import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

describe("API Route /api/summarize", () => {
    beforeEach(() => {
        // Configuramos variables de entorno para los tests
        vi.stubEnv("OLLAMA_URL", "http://192.168.1.152:11434/api/generate");
        vi.stubEnv("OLLAMA_MODEL", "qwen3.5:9b");

        // Limpiamos fetch global
        global.fetch = vi.fn();
    });

    it("debe devolver el resumen cuando Ollama responde 200", async () => {
        // Mock de fetch exitoso
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ response: "Resumen generado." }),
        });

        const request = new NextRequest("http://localhost:3000/api/summarize", {
            method: "POST",
            body: JSON.stringify({ prompt: "Texto de prueba" }),
        });

        const result = await POST(request);
        const data = await result.json();

        expect(result.status).toBe(200);
        expect(data).toEqual({ response: "Resumen generado." });
        expect(global.fetch).toHaveBeenCalledWith(
            "http://192.168.1.152:11434/api/generate",
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: expect.stringContaining('"prompt":"Texto de prueba"'),
            })
        );
    });

    it("debe manejar error 500 de Ollama con JSON", async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({ message: "Ollama busy" }),
        });

        const request = new NextRequest("http://localhost:3000/api/summarize", {
            method: "POST",
            body: JSON.stringify({ prompt: "Test error JSON" }),
        });

        const result = await POST(request);
        const data = await result.json();

        expect(result.status).toBe(500);
        expect(data.error).toBe("Ollama Error");
        expect(data.details).toEqual({ message: "Ollama busy" });
    });

    it("debe manejar error 500 de Ollama con texto plano", async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => { throw new Error("No JSON"); },
            text: async () => "Ollama offline",
        });

        const request = new NextRequest("http://localhost:3000/api/summarize", {
            method: "POST",
            body: JSON.stringify({ prompt: "Test error texto" }),
        });

        const result = await POST(request);
        const data = await result.json();

        expect(result.status).toBe(500);
        expect(data.error).toBe("Ollama Error");
        expect(data.details).toBe("Ollama offline");
    });

    it("debe lanzar error si no está configurada la URL", async () => {
        vi.stubEnv("OLLAMA_URL", "");
        const request = new NextRequest("http://localhost:3000/api/summarize", {
            method: "POST",
            body: JSON.stringify({ prompt: "Test sin URL" }),
        });

        const result = await POST(request);
        const data = await result.json();

        expect(result.status).toBe(500);
        expect(data.error).toBe("OLLAMA_URL no configurada");
    });

    it("debe lanzar error si no está configurado el modelo", async () => {
        vi.stubEnv("OLLAMA_URL", "http://192.168.1.152:11434/api/generate");
        vi.stubEnv("OLLAMA_MODEL", "");

        const request = new NextRequest("http://localhost:3000/api/summarize", {
            method: "POST",
            body: JSON.stringify({ prompt: "Test sin modelo" }),
        });

        const result = await POST(request);
        const data = await result.json();

        expect(result.status).toBe(500);
        expect(data.error).toBe("OLLAMA_MODEL no configurado");
    });
});