import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useLecciones } from "./useLecciones";
import { leccionesService } from "@/service/lecciones";

vi.mock("@/service/lecciones", () => ({
    leccionesService: {
        getAll: vi.fn(),
        insert: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("useLecciones - Hook de Paginación", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("debe cargar 9 lecciones y mostrar 8 con paginación", async () => {
        const mockData = Array.from({ length: 9 }, (_, i) => ({
            id: `${i}`, contenido: `C${i}`, resumen: `R${i}`, created_at: new Date().toISOString()
        }));
        (leccionesService.getAll as any).mockResolvedValue(mockData);

        const { result } = renderHook(() => useLecciones(1, 8));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.totalPaginas).toBe(2);
        expect(result.current.leccionesPaginadas).toHaveLength(8);
    });

    it("debe filtrar correctamente (Búsqueda Reactiva)", async () => {
        const mockData = [
            { id: '1', contenido: 'React', resumen: 'JS Framework', created_at: '...' },
            { id: '2', contenido: 'Python', resumen: 'Backend', created_at: '...' }
        ];
        (leccionesService.getAll as any).mockResolvedValue(mockData);

        const { result } = renderHook(() => useLecciones(1, 8));
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Actuamos sobre la búsqueda
        act(() => { result.current.buscar("Python"); });

        // Comprobamos que las filtradas bajen a 1
        expect(result.current.filtradas).toHaveLength(1);
        expect(result.current.filtradas[0].contenido).toBe("Python");
    });
});