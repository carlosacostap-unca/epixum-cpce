"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { Calendar, Users, LogOut } from "lucide-react";
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

export default function WelcomeDocentePage() {
  const router = useRouter();
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Validar sesión y rol
    if (!pb.authStore.isValid || pb.authStore.model?.rol !== "Docente") {
      router.push("/");
      return;
    }

    const user = pb.authStore.model;
    setUserName(user?.nombres || user?.name || "Docente");
    cargarModulos(user.id);
  }, [router]);

  const cargarModulos = async (userId: string) => {
    try {
      setLoading(true);
      // Buscamos solo los módulos donde el docente actual esté incluido en la relación "docentes"
      const records = await pb.collection("modulos").getFullList({
        sort: "titulo",
        filter: `docentes ~ "${userId}"`,
        expand: "docentes,estudiantes",
      });
      setModulos(records as unknown as Modulo[]);
    } catch (error) {
      console.error("Error al cargar módulos del docente:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-on-surface p-10 md:p-20">
      
      {/* Header Asimétrico */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20">
        <div className="max-w-2xl">
          <p className="text-label-lg text-tertiary tracking-widest uppercase mb-4">
            Panel de Docente
          </p>
          <h1 className="text-display-lg leading-tight">
            Hola, <br />
            <span className="text-primary">{userName}.</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant mt-6 max-w-xl">
            Aquí puedes ver los módulos de la diplomatura a los cuales estás asignado como docente.
          </p>
        </div>

        <button 
          onClick={handleLogout}
          className="btn-secondary py-3 px-6 rounded-full flex items-center gap-3 shrink-0"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-label-md">Cerrar Sesión</span>
        </button>
      </div>

      {/* Grid de Módulos (Cards estilo galería) */}
      <div className="space-y-6 mb-10">
        <h2 className="text-headline-md">Mis Módulos Asignados</h2>
      </div>

      {loading ? (
        <div className="text-on-surface-variant text-center py-20">Cargando tus módulos...</div>
      ) : modulos.length === 0 ? (
        <div className="bg-surface-container rounded-[2rem] p-20 text-center border border-outline-variant/15">
          <p className="text-title-lg mb-2">No tienes módulos asignados</p>
          <p className="text-body-lg text-on-surface-variant">
            Aún no has sido asignado como docente a ningún módulo. Contacta al administrador si crees que esto es un error.
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
                  onClick={() => router.push(`/welcome/docente/modulos/${modulo.id}`)}
                  className="flex-1 bg-surface-container-highest text-on-surface hover:text-primary transition-colors py-3 rounded-full text-label-md cursor-pointer"
                >
                  Ingresar al Módulo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
