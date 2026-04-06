"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { LogOut, BookOpen, Calendar } from "lucide-react";
import { formatDateToDDMMYYYY } from "@/lib/utils/dateHelpers";

interface Modulo {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
}

export default function EstudianteWelcomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push("/");
    } else {
      const user = pb.authStore.model;
      if (user) {
        setUserName(user.nombres || user.name || "Estudiante");
        cargarModulosAsignados(user.id);
      }
    }
  }, [router]);

  const cargarModulosAsignados = async (userId: string) => {
    try {
      setLoading(true);
      // Obtenemos los módulos donde el ID del estudiante está en el array de estudiantes
      const records = await pb.collection("modulos").getFullList({
        filter: `estudiantes ~ "${userId}"`,
        sort: "fecha_inicio",
      });
      setModulos(records as unknown as Modulo[]);
    } catch (error) {
      console.error("Error al cargar los módulos asignados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* Main Content Area */}
      <main className="flex-1 p-10 md:p-20">
        
        {/* Top Action Bar */}
        <div className="flex justify-end mb-8">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
            title="Cerrar Sesión"
          >
            <span className="text-label-sm uppercase tracking-widest">Cerrar Sesión</span>
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Header */}
        <div className="mb-20">
          <div className="max-w-2xl">
            <p className="text-label-md text-primary tracking-widest uppercase mb-4">
              Panel de Estudiante
            </p>
            <h1 className="text-display-lg leading-tight">
              Bienvenido de nuevo,<br />
              <span className="text-on-surface-variant">{userName}.</span>
            </h1>
          </div>
        </div>

        {/* Content Section - Cards without lines */}
        <section>
          <h2 className="text-headline-sm mb-10">Mis Módulos</h2>
          
          {loading ? (
            <div className="flex justify-center p-20">
              <p className="text-on-surface-variant">Cargando módulos...</p>
            </div>
          ) : modulos.length === 0 ? (
            <div className="bg-surface-container rounded-[2rem] p-10 text-center ambient-shadow">
              <BookOpen className="w-12 h-12 text-tertiary mx-auto mb-4 opacity-50" />
              <h3 className="text-title-lg mb-2">Sin módulos asignados</h3>
              <p className="text-body-md text-on-surface-variant">
                Actualmente no te encuentras inscripto en ningún módulo de la diplomatura.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {modulos.map((modulo, index) => (
                <div key={modulo.id} className="bg-surface-container rounded-[2rem] p-8 flex flex-col h-full ambient-shadow relative group">
                  <div className="mb-6 flex-1">
                    <span className="text-label-sm text-tertiary bg-tertiary/10 px-3 py-1 rounded-full mb-4 inline-block">
                      Módulo {index + 1}
                    </span>
                    <h3 className="text-title-lg mb-2">{modulo.titulo}</h3>
                    <p className="text-body-md text-on-surface-variant line-clamp-3">
                      {modulo.descripcion}
                    </p>
                  </div>
                  
                  <div className="mb-8 flex flex-col gap-2 border-t border-outline-variant/15 pt-4">
                    <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
                      <Calendar className="w-4 h-4 text-tertiary" />
                      <span>Inicio: {formatDateToDDMMYYYY(modulo.fecha_inicio) || "Sin definir"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
                      <Calendar className="w-4 h-4 text-error" />
                      <span>Fin: {formatDateToDDMMYYYY(modulo.fecha_fin) || "Sin definir"}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push(`/welcome/estudiante/modulos/${modulo.id}`)}
                    className="btn-secondary w-full py-4 rounded-full text-title-sm cursor-pointer group-hover:bg-primary group-hover:text-on-primary transition-colors"
                  >
                    Ingresar al Módulo
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
