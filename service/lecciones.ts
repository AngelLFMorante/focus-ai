import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Leccion {
    id: string;
    contenido: string;
    resumen: string;
    created_at: string;
}

export const leccionesService = {
    // Obtener todas las lecciones ordenadas por fecha (más recientes primero)
    getAll: async (): Promise<Leccion[]> => {
        const { data, error } = await supabase
            .from("lecciones")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error al obtener lecciones:", error);
            throw error;
        }

        return data || [];
    },

    // Insertar nueva lección
    insert: async (leccion: Omit<Leccion, "id" | "created_at">): Promise<void> => {
        const { error } = await supabase
            .from("lecciones")
            .insert({
                contenido: leccion.contenido,
                resumen: leccion.resumen,
            });

        if (error) {
            console.error("Error al insertar lección:", error);
            throw error;
        }
    },

    // Obtener lección por ID
    getById: async (id: string): Promise<Leccion | null> => {
        const { data, error } = await supabase
            .from("lecciones")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error al obtener lección por ID:", error);
            throw error;
        }

        return data || null;
    },

    // Eliminar lección por ID
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from("lecciones")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error al eliminar lección:", error);
            throw error;
        }
    },

    // Buscar lecciones por término
    search: async (term: string): Promise<Leccion[]> => {
        const { data, error } = await supabase
            .from("lecciones")
            .select("*")
            .ilike("resumen", `%${term}%`)
            .or(`ilike(contenido, %${term}%)`)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error al buscar lecciones:", error);
            throw error;
        }

        return data || [];
    },
};
