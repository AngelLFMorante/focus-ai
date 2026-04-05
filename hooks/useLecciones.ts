"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { leccionesService, Leccion } from "@/service/lecciones";

export interface UseLeccionesReturn {
    lecciones: Leccion[];
    loading: boolean;
    error: Error | null;
    busqueda: string;
    paginaActual: number;
    elementosPorPagina: number;
    totalPaginas: number;
    leccionesPaginadas: Leccion[];
    filtradas: Leccion[];
    cargarLecciones: () => Promise<void>;
    buscar: (term: string) => void;
    irAPagina: (pagina: number) => void;
}

export function useLecciones(
    paginaInicial: number = 1,
    elementosPorPagina: number = 8
): UseLeccionesReturn {
    const [lecciones, setLecciones] = useState<Leccion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(paginaInicial);

    const cargarLecciones = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await leccionesService.getAll();
            setLecciones(data);
        } catch (err) {
            setError(err as Error);
            console.error("Error al cargar lecciones:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const buscar = useCallback((term: string) => {
        setBusqueda(term);
    }, []);

    const filtradas = useMemo(() => {
        if (!busqueda) return lecciones;

        const term = busqueda.toLowerCase();
        return lecciones.filter((l) =>
            l.resumen?.toLowerCase().includes(term) ||
            l.contenido?.toLowerCase().includes(term)
        );
    }, [lecciones, busqueda]);

    const totalPaginas = useMemo(() => {
        return Math.max(1, Math.ceil(filtradas.length / elementosPorPagina));
    }, [filtradas.length, elementosPorPagina]);

    const leccionesPaginadas = useMemo(() => {
        const inicio = (paginaActual - 1) * elementosPorPagina;
        const fin = inicio + elementosPorPagina;
        return filtradas.slice(inicio, fin);
    }, [filtradas, paginaActual, elementosPorPagina]);

    const irAPagina = useCallback((pagina: number) => {
        setPaginaActual(Math.max(1, Math.min(pagina, totalPaginas)));
    }, [totalPaginas]);

    useEffect(() => {
        cargarLecciones();
    }, [cargarLecciones]);

    useEffect(() => {
        cargarLecciones();
    }, [paginaActual]);

    return {
        lecciones: leccionesPaginadas,
        loading,
        error,
        busqueda,
        paginaActual,
        elementosPorPagina,
        totalPaginas,
        leccionesPaginadas,
        filtradas,
        cargarLecciones,
        buscar,
        irAPagina,
    };
}
