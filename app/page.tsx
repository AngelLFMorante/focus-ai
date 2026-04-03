import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navbar */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">FocusAI</h1>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Generar Lección</h2>
            <p className="text-muted-foreground">Describe el tema de la lección que deseas generar con inteligencia artificial.</p>
          </div>

          <div className="space-y-4">
            <Textarea
              placeholder="Ej: Introducción a la computación cuántica..."
              className="min-h-[200px] resize-none text-lg p-4 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button
              className="w-full h-12 text-lg font-medium bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-white transition-colors"
            >
              Generar Lección con IA
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
