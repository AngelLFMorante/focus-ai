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
    // Obtener todas las lecciones ordenadas por fecha
    getAll: async (): Promise<Leccion[]> => {
        const { data, error } = await supabase
            .from("lecciones")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        return data || [];
    },

    // Insertar nueva lección (DEVOLVIENDO DATA)
    insert: async (
        leccion: Omit<Leccion, "id" | "created_at">
    ): Promise<Leccion> => {
        const { data, error } = await supabase
            .from("lecciones")
            .insert({
                contenido: leccion.contenido,
                resumen: leccion.resumen,
            })
            .select()
            .single();

        if (error) throw error;

        return data;
    },

    // Eliminar lección
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from("lecciones")
            .delete()
            .eq("id", id);

        if (error) throw error;
    },
};