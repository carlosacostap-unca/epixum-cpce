"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import pb from "@/lib/pocketbase";
import { ArrowLeft, Save, Trash2, Link as LinkIcon, FileText } from "lucide-react";
import { dateTimeToUTCString, utcToLocalDateTimeString } from "@/lib/utils/dateHelpers";

type TipoRecurso = "enlace" | "archivo";

interface RecursoForm {
  id: string; // ID de PB o temporal
  tipo: TipoRecurso;
  titulo: string;
  enlace: string;
  archivo: File | null;
  archivoExistenteUrl?: string; // Para mostrar el archivo actual si ya existe
  archivoExistenteNombre?: string;
  isNew?: boolean;
}

export default function EditarClasePage() {
  const router = useRouter();
  const params = useParams();
  const moduloId = params.id as string;
  const claseId = params.claseId as string;
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [loading, setLoading] = useState(true);
  const [recursos, setRecursos] = useState<RecursoForm[]>([]);
  const [recursosAEliminar, setRecursosAEliminar] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fecha_hora: "",
  });

  useEffect(() => {
    // Validar sesión y rol
    if (!pb.authStore.isValid || pb.authStore.model?.rol !== "Docente") {
      router.push("/");
      return;
    }

    cargarClase();
  }, [router, claseId]);

  const cargarClase = async () => {
    try {
      setLoading(true);
      
      // 1. Cargar datos de la clase
      const claseRecord = await pb.collection("clases").getOne(claseId);
      
      setFormData({
        titulo: claseRecord.titulo,
        descripcion: claseRecord.descripcion,
        fecha_hora: claseRecord.fecha_hora ? utcToLocalDateTimeString(claseRecord.fecha_hora) : "",
      });

      // 2. Cargar recursos de la clase
      const recursosRecords = await pb.collection("recursos").getFullList({
        filter: `clase = "${claseId}"`,
      });

      const recursosFormateados: RecursoForm[] = recursosRecords.map((r) => ({
        id: r.id,
        tipo: r.tipo as TipoRecurso,
        titulo: r.titulo,
        enlace: r.enlace || "",
        archivo: null,
        archivoExistenteUrl: r.archivo ? pb.files.getURL(r, r.archivo) : undefined,
        archivoExistenteNombre: r.archivo,
        isNew: false,
      }));

      setRecursos(recursosFormateados);
    } catch (error) {
      console.error("Error al cargar la clase:", error);
      alert("Error al cargar los datos de la clase.");
      router.push(`/welcome/docente/modulos/${moduloId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const agregarRecurso = (tipo: TipoRecurso) => {
    setRecursos([
      ...recursos,
      {
        id: Math.random().toString(36).substr(2, 9),
        tipo,
        titulo: "",
        enlace: "",
        archivo: null,
        isNew: true,
      },
    ]);
  };

  const eliminarRecurso = (id: string, isNew?: boolean) => {
    if (!isNew) {
      // Si el recurso ya existe en la base de datos, lo agregamos a la lista para eliminarlo después
      setRecursosAEliminar([...recursosAEliminar, id]);
    }
    setRecursos(recursos.filter((r) => r.id !== id));
  };

  const actualizarRecurso = (id: string, campo: string, valor: any) => {
    setRecursos(
      recursos.map((r) => (r.id === id ? { ...r, [campo]: valor } : r))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Actualizar la clase
      const claseData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha_hora: formData.fecha_hora ? dateTimeToUTCString(formData.fecha_hora) : null,
      };

      await pb.collection("clases").update(claseId, claseData);
      
      // 2. Eliminar recursos marcados
      const deletePromises = recursosAEliminar.map((id) => 
        pb.collection("recursos").delete(id)
      );
      await Promise.all(deletePromises);

      // 3. Crear o actualizar recursos
      const recursosPromises = recursos.map(async (recurso) => {
        const recFormData = new FormData();
        recFormData.append("clase", claseId);
        recFormData.append("tipo", recurso.tipo);
        recFormData.append("titulo", recurso.titulo);
        
        if (recurso.tipo === "enlace" && recurso.enlace) {
          recFormData.append("enlace", recurso.enlace);
        } else if (recurso.tipo === "archivo" && recurso.archivo) {
          recFormData.append("archivo", recurso.archivo);
        }

        if (recurso.isNew) {
          return pb.collection("recursos").create(recFormData);
        } else {
          return pb.collection("recursos").update(recurso.id, recFormData);
        }
      });

      await Promise.all(recursosPromises);
      
      // Redirigir de vuelta a la lista de clases del módulo
      router.push(`/welcome/docente/modulos/${moduloId}`);
    } catch (error) {
      console.error("Error al actualizar la clase:", error);
      alert("Hubo un error al actualizar la clase y sus recursos. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && recursos.length === 0) {
    return <div className="min-h-screen bg-background p-20 text-center text-on-surface-variant">Cargando datos de la clase...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface p-10 md:p-20">
      
      {/* Header Asimétrico */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20">
        <div className="max-w-2xl">
          <button 
            onClick={() => router.push(`/welcome/docente/modulos/${moduloId}`)}
            className="flex items-center gap-2 text-primary mb-8 hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-label-sm uppercase tracking-widest">Volver a Clases</span>
          </button>
          
          <h1 className="text-display-lg leading-tight">
            Editar <br />
            <span className="text-tertiary">Clase.</span>
          </h1>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-3xl bg-surface-container rounded-[2rem] p-10 ambient-shadow">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Título */}
          <div className="space-y-2">
            <label htmlFor="titulo" className="text-label-sm">Título de la Clase</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              required
              className="input-well"
              placeholder="Ej. Introducción a la IA Generativa"
              value={formData.titulo}
              onChange={handleChange}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label htmlFor="descripcion" className="text-label-sm">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              required
              rows={4}
              className="input-well resize-none"
              placeholder="Describe los temas que se abordarán en esta clase..."
              value={formData.descripcion}
              onChange={handleChange}
            />
          </div>

          {/* Fecha y Hora */}
          <div className="space-y-2">
            <label htmlFor="fecha_hora" className="text-label-sm">Fecha y Hora</label>
            <input
              type="datetime-local"
              id="fecha_hora"
              name="fecha_hora"
              required
              className="input-well"
              value={formData.fecha_hora}
              onChange={handleChange}
            />
          </div>

          {/* Recursos Dinámicos */}
          <div className="space-y-6 pt-8 border-t border-outline-variant/15">
            <div>
              <h3 className="text-title-md text-on-surface mb-2">Recursos de la Clase</h3>
              <p className="text-body-sm text-on-surface-variant">
                Añade o elimina enlaces y archivos relevantes para esta clase.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => agregarRecurso("enlace")}
                className="btn-secondary py-2 px-4 rounded-full flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                <span className="text-label-sm">Añadir Enlace</span>
              </button>
              <button
                type="button"
                onClick={() => agregarRecurso("archivo")}
                className="btn-secondary py-2 px-4 rounded-full flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span className="text-label-sm">Añadir Archivo</span>
              </button>
            </div>

            {recursos.length > 0 && (
              <div className="space-y-4">
                {recursos.map((recurso, index) => (
                  <div key={recurso.id} className="bg-surface-container-highest p-6 rounded-2xl border border-outline-variant/20 relative flex flex-col gap-4">
                    
                    <button
                      type="button"
                      onClick={() => eliminarRecurso(recurso.id, recurso.isNew)}
                      className="absolute top-4 right-4 text-on-surface-variant hover:text-error transition-colors"
                      title="Eliminar recurso"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2 text-tertiary mb-2">
                      {recurso.tipo === "enlace" ? <LinkIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      <span className="text-label-sm uppercase tracking-widest">
                        Recurso: {recurso.tipo}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-label-sm">Título del recurso</label>
                        <input
                          type="text"
                          required
                          className="input-well"
                          placeholder="Ej. Presentación PDF"
                          value={recurso.titulo}
                          onChange={(e) => actualizarRecurso(recurso.id, "titulo", e.target.value)}
                        />
                      </div>

                      {recurso.tipo === "enlace" ? (
                        <div className="space-y-2">
                          <label className="text-label-sm">URL del enlace</label>
                          <input
                            type="url"
                            required
                            className="input-well"
                            placeholder="https://..."
                            value={recurso.enlace}
                            onChange={(e) => actualizarRecurso(recurso.id, "enlace", e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-label-sm">Archivo</label>
                          <input
                            type="file"
                            className="hidden"
                            ref={(el) => {
                              fileInputRefs.current[recurso.id] = el;
                            }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                actualizarRecurso(recurso.id, "archivo", e.target.files[0]);
                              }
                            }}
                          />
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => fileInputRefs.current[recurso.id]?.click()}
                                className="bg-surface-container border border-outline-variant/30 py-3 px-4 rounded-xl text-label-sm hover:bg-surface-container-high transition-colors"
                              >
                                {recurso.archivo || !recurso.archivoExistenteNombre ? "Seleccionar Archivo" : "Cambiar Archivo"}
                              </button>
                              <span className="text-body-sm text-on-surface-variant truncate max-w-[200px]">
                                {recurso.archivo ? recurso.archivo.name : (recurso.archivoExistenteNombre || "Ningún archivo seleccionado")}
                              </span>
                            </div>
                            {!recurso.archivo && recurso.archivoExistenteUrl && (
                              <a 
                                href={recurso.archivoExistenteUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-body-sm text-primary hover:underline"
                              >
                                Ver archivo actual
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="pt-10 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push(`/welcome/docente/modulos/${moduloId}`)}
              className="btn-secondary py-3 px-8 rounded-full"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-3 px-8 rounded-full flex items-center gap-3"
            >
              {loading ? (
                <span className="text-label-md">Guardando...</span>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span className="text-label-md">Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}