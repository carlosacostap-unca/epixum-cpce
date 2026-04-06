"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import pb from "@/lib/pocketbase";
import { ArrowLeft, Plus, Clock, FileText, Link as LinkIcon, Pencil, Trash2 } from "lucide-react";
import { formatDateTimeToLocal } from "@/lib/utils/dateHelpers";

interface Recurso {
  id: string;
  tipo: "enlace" | "archivo";
  titulo: string;
  enlace: string;
  archivo: string;
  clase: string;
}

interface Clase {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_hora: string;
  recursos?: Recurso[];
}

interface Modulo {
  id: string;
  titulo: string;
  descripcion: string;
}

export default function DocenteModuloPage() {
  const router = useRouter();
  const params = useParams();
  const moduloId = params.id as string;

  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validar sesión y rol
    if (!pb.authStore.isValid || pb.authStore.model?.rol !== "Docente") {
      router.push("/");
      return;
    }

    cargarDatos();
  }, [router, moduloId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // 1. Cargar datos del módulo
      const modRecord = await pb.collection("modulos").getOne(moduloId);
      setModulo(modRecord as unknown as Modulo);

      // 2. Cargar las clases pertenecientes a este módulo
      const clasesRecords = await pb.collection("clases").getFullList({
        filter: `modulo = "${moduloId}"`,
        sort: "fecha_hora",
      });
      
      const clasesConRecursos = await Promise.all(
        clasesRecords.map(async (clase) => {
          try {
            const recursosRecords = await pb.collection("recursos").getFullList({
              filter: `clase = "${clase.id}"`,
            });
            return {
              ...clase,
              recursos: recursosRecords as unknown as Recurso[],
            };
          } catch (e) {
            console.error(`Error cargando recursos para la clase ${clase.id}:`, e);
            return { ...clase, recursos: [] };
          }
        })
      );
      
      setClases(clasesConRecursos as unknown as Clase[]);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarClase = async (claseId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta clase? Esta acción también eliminará sus recursos asociados.")) {
      return;
    }
    
    try {
      setLoading(true);
      // 1. Obtener y eliminar todos los recursos asociados (si no hay Cascade Delete activado)
      const recursosRecords = await pb.collection("recursos").getFullList({
        filter: `clase = "${claseId}"`,
      });
      
      const recursosPromises = recursosRecords.map((recurso) => 
        pb.collection("recursos").delete(recurso.id)
      );
      await Promise.all(recursosPromises);

      // 2. Eliminar la clase
      await pb.collection("clases").delete(claseId);
      
      // 3. Recargar la lista de clases
      await cargarDatos();
    } catch (error) {
      console.error("Error al eliminar la clase:", error);
      alert("Hubo un error al eliminar la clase. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  const renderEnlaces = (recursos: Recurso[] = []) => {
    const enlaces = recursos.filter((r) => r.tipo === "enlace");
    if (enlaces.length === 0) return null;

    return (
      <div className="mt-4 pt-4 border-t border-outline-variant/15">
        <h4 className="text-label-sm text-tertiary mb-3 flex items-center gap-2">
          <LinkIcon className="w-4 h-4" /> Enlaces de la clase
        </h4>
        <ul className="space-y-2">
          {enlaces.map((recurso) => (
            <li key={recurso.id}>
              <a 
                href={recurso.enlace} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block"
              >
                <span className="text-body-md text-on-surface group-hover:text-primary transition-colors block">
                  {recurso.titulo}
                </span>
                <span className="text-body-sm text-on-surface-variant truncate block">
                  {recurso.enlace}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderArchivos = (recursos: Recurso[] = []) => {
    const archivos = recursos.filter((r) => r.tipo === "archivo" && r.archivo);
    if (archivos.length === 0) return null;

    return (
      <div className="mt-4 pt-4 border-t border-outline-variant/15">
        <h4 className="text-label-sm text-tertiary mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Recursos Adjuntos
        </h4>
        <ul className="space-y-3">
          {archivos.map((recurso) => (
            <li key={recurso.id}>
              <a 
                href={pb.files.getURL(recurso as any, recurso.archivo)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <FileText className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-body-md text-on-surface group-hover:text-primary transition-colors truncate">
                    {recurso.titulo}
                  </span>
                  <span className="text-body-sm text-on-surface-variant truncate">
                    {recurso.archivo}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-on-surface p-10 md:p-20">
      
      {/* Header Asimétrico */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20">
        <div className="max-w-2xl">
          <button 
            onClick={() => router.push("/welcome/docente")}
            className="flex items-center gap-2 text-primary mb-8 hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-label-sm uppercase tracking-widest">Volver al Panel</span>
          </button>
          
          <h1 className="text-display-lg leading-tight">
            Gestión de <br />
            <span className="text-tertiary">Clases.</span>
          </h1>
          {modulo && (
            <p className="text-body-lg text-on-surface-variant mt-4">
              Módulo: {modulo.titulo}
            </p>
          )}
        </div>

        <button 
          onClick={() => router.push(`/welcome/docente/modulos/${moduloId}/clases/crear`)}
          className="btn-primary py-4 px-8 rounded-full flex items-center gap-3 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span className="text-title-sm">Nueva Clase</span>
        </button>
      </div>

      {loading ? (
        <div className="text-on-surface-variant text-center py-20">Cargando clases...</div>
      ) : clases.length === 0 ? (
        <div className="bg-surface-container rounded-[2rem] p-20 text-center border border-outline-variant/15">
          <p className="text-title-lg mb-2">No hay clases programadas</p>
          <p className="text-body-lg text-on-surface-variant">
            Aún no has creado ninguna clase para este módulo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {clases.map((clase) => (
            <div key={clase.id} className="bg-surface-container rounded-[2rem] p-8 flex flex-col ambient-shadow relative group">
              
              {/* Acciones de Clase */}
              <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => router.push(`/welcome/docente/modulos/${moduloId}/clases/${clase.id}`)}
                  className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Editar Clase"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => eliminarClase(clase.id)}
                  className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                  title="Eliminar Clase"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-title-lg mb-3 pr-24">{clase.titulo}</h3>
              <p className="text-body-md text-on-surface-variant whitespace-pre-wrap mb-6 flex-1">
                {clase.descripcion}
              </p>

              <div className="flex items-center gap-3 text-label-sm text-on-surface-variant mb-2">
                <Clock className="w-4 h-4 text-tertiary" />
                <span>{formatDateTimeToLocal(clase.fecha_hora)}</span>
              </div>

              {renderEnlaces(clase.recursos)}
              {renderArchivos(clase.recursos)}
              
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
