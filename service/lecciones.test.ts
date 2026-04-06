import { describe, it, expect, vi, beforeEach } from "vitest";
import { leccionesService, supabase } from "./lecciones";

// MOCK COMPLETO DE SUPABASE
vi.mock("@supabase/supabase-js", () => {
    const mock = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
    };

    return {
        createClient: () => mock,
    };
});

describe("leccionesService - CRUD Operations", () => {
    const s = supabase as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("debe obtener todas las lecciones ordenadas", async () => {
        const mockData = [{ id: "1", contenido: "Test", resumen: "R", created_at: "now" }];

        // Mock de getAll
        s.order.mockResolvedValue({ data: mockData, error: null });

        const result = await leccionesService.getAll();

        expect(s.from).toHaveBeenCalledWith("lecciones");
        expect(s.order).toHaveBeenCalledWith("created_at", { ascending: false });
        expect(result).toEqual(mockData);
    });

    it("debe insertar lección", async () => {
        const newLeccion = { contenido: "C", resumen: "R" };
        const insertedLeccion = { id: "1", ...newLeccion, created_at: "now" };

        // Mock cadena insert → select → single
        s.single.mockResolvedValue({ data: insertedLeccion, error: null });

        const result = await leccionesService.insert(newLeccion);

        expect(s.insert).toHaveBeenCalledWith({
            contenido: "C",
            resumen: "R",
        });
        expect(result).toEqual(insertedLeccion);
    });

    it("debe eliminar lección por ID", async () => {
        // Mock delete → eq
        s.eq.mockResolvedValue({ data: null, error: null });

        await leccionesService.delete("123");

        expect(s.from).toHaveBeenCalledWith("lecciones");
        expect(s.eq).toHaveBeenCalledWith("id", "123");
    });
});