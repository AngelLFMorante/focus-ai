"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

interface Leccion {
  id: string;
  contenido: string;
  resumen: string;
  created_at: string;
}

export default function Home() {
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [verTodas, setVerTodas] = useState(false);

  const cargarLecciones = async () => {
    const { data } = await supabase.from("lecciones").select("*").order("created_at", { ascending: false });
    setLecciones(data || []);
  };

  useEffect(() => { cargarLecciones(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("http://192.168.1.152:11434/api/generate", {
        method: "POST",
        body: JSON.stringify({ model: "qwen3.5:9b", prompt: `Resume en 2 frases: ${texto}`, stream: false }),
      });
      const data = await response.json();
      await supabase.from("lecciones").insert({ contenido: texto, resumen: data.response });
      setTexto("");
      await cargarLecciones();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const filtradas = lecciones.filter(l =>
    l.resumen?.toLowerCase().includes(busqueda.toLowerCase()) ||
    l.contenido?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const visibles = verTodas ? filtradas : filtradas.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 mb-8">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900">FocusAI</h1>
          <p className="text-slate-500 text-sm">Resumidor inteligente de temario.</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 space-y-10">
        {/* Formulario Limpio */}
        <section>
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Pega aquí el texto que quieres resumir..."
                className="min-h-[200px] border-none focus-visible:ring-0 text-lg p-6 bg-white"
              />
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !texto.trim()}
                  className="bg-[#06b6d4] hover:bg-[#0891b2] text-white px-8"
                >
                  {loading ? "IA Procesando..." : "Analizar y Guardar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buscador y Lista */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Buscar en tus lecciones..."
              className="flex-1 p-2 bg-transparent border-b border-slate-300 focus:border-[#06b6d4] outline-none text-sm"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="grid gap-4">
            {visibles.map((l) => (
              <Card key={l.id} className="border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-bold text-slate-900 leading-tight">{l.resumen}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2">{l.contenido}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                    {new Date(l.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtradas.length > 6 && !verTodas && (
            <Button variant="ghost" className="w-full text-slate-500" onClick={() => setVerTodas(true)}>
              Cargar todas ({filtradas.length})
            </Button>
          )}
        </section>
      </main>
    </div>
  );
}
