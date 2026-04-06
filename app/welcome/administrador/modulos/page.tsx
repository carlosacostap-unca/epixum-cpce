"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { ArrowLeft, Plus, Calendar, Users } from "lucide-react";
import { formatDateToDDMMYYYY } from "@/lib/utils/dateHelpers";

interface Modulo {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  expand?: {
    docentes?: any[];
    estudiantes?: any[];
  };
}

export default function ModulosAdminPage() {
  const router = useRouter();
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validar sesión y rol
    if (!pb.authStore.isValid || pb.authStore.model?.rol !== "Administrador") {
      router.push("/");
      return;
    }

    cargarModulos();
  }, [router]);

  const cargarModulos = async () => {
    try {
      setLoading(true);
      // Expandimos docentes y estudiantes para mostrar conteos
      const records = await pb.collection("modulos").getFullList({
        sort: "titulo",
        expand: "docentes,estudiantes",
      });
      setModulos(records as unknown as Modulo[]);
    } catch (error) {
      console.error("Error al cargar módulos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface p-10 md:p-20">
      
      {/* Header Asimétrico */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20">
        <div className="max-w-2xl">
          <button 
            onClick={() => router.push("/welcome/administrador")}
            className="flex items-center gap-2 text-primary mb-8 hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-label-sm uppercase tracking-widest">Volver al Panel</span>
          </button>
          
          <h1 className="text-display-lg leading-tight">
            Gestión de <br />
            <span className="text-tertiary">Módulos.</span>
          </h1>
        </div>

        <button 
          onClick={() => router.push("/welcome/administrador/modulos/crear")}
          className="btn-primary py-4 px-8 rounded-full flex items-center gap-3 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span className="text-title-sm">Nuevo Módulo</span>
        </button>
      </div>

      {/* Grid de Módulos (Cards estilo galería) */}
      {loading ? (
        <div className="text-on-surface-variant text-center py-20">Cargando módulos...</div>
      ) : modulos.length === 0 ? (
        <div className="bg-surface-container rounded-[2rem] p-20 text-center border border-outline-variant/15">
          <p className="text-title-lg mb-2">No hay módulos creados</p>
          <p className="text-body-lg text-on-surface-variant">
            Comienza agregando el primer módulo de la diplomatura.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {modulos.map((modulo) => (
            <div key={modulo.id} className="bg-surface-container rounded-[2rem] p-8 flex flex-col h-full ambient-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-tertiary/5 rounded-full blur-[50px] -mr-10 -mt-10 group-hover:bg-tertiary/10 transition-colors"></div>
              
              <div className="relative z-10 flex-1">
                <h3 className="text-title-lg mb-3">{modulo.titulo}</h3>
                <p className="text-body-md text-on-surface-variant line-clamp-3 mb-6">
                  {modulo.descripcion}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
                    <Calendar className="w-4 h-4 text-tertiary" />
                    <span>
                      {formatDateToDDMMYYYY(modulo.fecha_inicio)} a {formatDateToDDMMYYYY(modulo.fecha_fin)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
                    <Users className="w-4 h-4 text-tertiary" />
                    <span>
                      {modulo.expand?.docentes?.length || 0} Docentes • {modulo.expand?.estudiantes?.length || 0} Estudiantes
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-8 pt-6 border-t border-outline-variant/15 flex gap-4">
                <button 
                  onClick={() => router.push(`/welcome/administrador/modulos/${modulo.id}`)}
                  className="flex-1 btn-secondary py-3 rounded-full text-label-md cursor-pointer"
                >
                  Editar
                </button>
                <button className="flex-1 bg-surface-container-highest text-on-surface hover:text-primary transition-colors py-3 rounded-full text-label-md cursor-pointer">
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
