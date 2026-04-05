"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { Trash2 } from "lucide-react";
import { useLecciones } from "@/hooks/useLecciones";
import { leccionesService } from "@/service/lecciones";

export default function Home() {
  const {
    lecciones,
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
  } = useLecciones(1, 8);

  const [texto, setTexto] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Resume en 2 frases: ${texto}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error en API summarize:", errorData);
        return;
      }

      const data = await response.json();
      console.log("Respuesta IA:", data);
      await leccionesService.insert({ contenido: texto, resumen: data.response });
      await cargarLecciones();
      setTexto("");
    } catch (err) {
      console.error("Error al generar resumen:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await leccionesService.delete(id);
      await cargarLecciones();
    } catch (err) {
      console.error("Error al eliminar lección:", err);
    }
  };

  const paginacion = useMemo(() => {
    const items: (number | string)[] = [];
    const maxItems = 5;

    if (totalPaginas <= maxItems) {
      for (let i = 1; i <= totalPaginas; i++) {
        items.push(i);
      }
    } else {
      if (paginaActual > 3) {
        items.push(1);
        items.push("...");
      }

      const inicio = Math.max(2, paginaActual - 1);
      const fin = Math.min(totalPaginas, paginaActual + 1);

      for (let i = inicio; i <= fin; i++) {
        items.push(i);
      }

      if (paginaActual < totalPaginas - 2) {
        items.push("...");
        items.push(totalPaginas);
      }
    }

    return items;
  }, [paginaActual, totalPaginas]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900">FocusAI</h1>
          <p className="text-slate-500 text-sm">Resumidor inteligente de temario.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 space-y-10">
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
                  disabled={isAnalyzing || loading || !texto.trim()}
                  className="bg-[#06b6d4] hover:bg-[#0891b2] text-white px-8"
                >
                  {isAnalyzing ? "IA Procesando..." : "Analizar y Guardar"}
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
              onChange={(e) => buscar(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {lecciones.map((leccion) => (
              <Card key={leccion.id} className="border-slate-200 hover:shadow-md transition-shadow group">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 leading-tight text-sm">{leccion.resumen}</h3>
                      <p className="text-slate-500 text-xs line-clamp-2 mt-1">{leccion.contenido}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">
                        {new Date(leccion.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(leccion.id)}
                      title="Eliminar lección"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtradas.length > 0 && (
            <Pagination className="justify-center">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => irAPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="h-8 px-3 text-xs"
                  >
                    Anterior
                  </Button>
                </PaginationItem>

                {paginacion.map((item, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      isActive={item === paginaActual}
                      onClick={() => typeof item === "number" && irAPagina(item)}
                      className={`h-8 w-8 px-0 ${item === paginaActual
                          ? "bg-[#06b6d4] text-white hover:bg-[#0891b2]"
                          : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => irAPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="h-8 px-3 text-xs"
                  >
                    Siguiente
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </section>
      </main>
    </div>
  );
}
