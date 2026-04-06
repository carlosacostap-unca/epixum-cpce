"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { ArrowLeft, Save } from "lucide-react";
import { dateToUTCString } from "@/lib/utils/dateHelpers";

export default function CrearModuloPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [docentesOptions, setDocentesOptions] = useState<any[]>([]);
  const [estudiantesOptions, setEstudiantesOptions] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    docentes: [] as string[],
    estudiantes: [] as string[],
  });

  useEffect(() => {
    if (!pb.authStore.isValid || pb.authStore.model?.rol !== "Administrador") {
      router.push("/");
      return;
    }
    cargarUsuarios();
  }, [router]);

  const cargarUsuarios = async () => {
    try {
      const records = await pb.collection("users").getFullList({
        filter: 'rol="Docente" || rol="Estudiante"',
        sort: "nombres,apellidos"
      });
      
      const docentes = records.filter(r => r.rol === "Docente");
      const estudiantes = records.filter(r => r.rol === "Estudiante");
      
      setDocentesOptions(docentes);
      setEstudiantesOptions(estudiantes);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, listName: "docentes" | "estudiantes") => {
    const value = e.target.value;
    const isChecked = e.target.checked;
    setFormData(prev => {
      const list = prev[listName];
      if (isChecked) {
        return { ...prev, [listName]: [...list, value] };
      } else {
        return { ...prev, [listName]: list.filter(id => id !== value) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        fecha_inicio: formData.fecha_inicio ? dateToUTCString(formData.fecha_inicio) : "",
        fecha_fin: formData.fecha_fin ? dateToUTCString(formData.fecha_fin) : "",
      };

      await pb.collection("modulos").create(dataToSave);
      router.push("/welcome/administrador/modulos");
    } catch (error) {
      console.error("Error al crear el módulo:", error);
      alert("Hubo un error al crear el módulo. Verifica la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface p-10 md:p-20">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push("/welcome/administrador/modulos")}
          className="flex items-center gap-2 text-primary mb-8 hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-label-sm uppercase tracking-widest">Volver a Módulos</span>
        </button>
        
        <h1 className="text-display-md mb-10">Nuevo Módulo</h1>

        <form onSubmit={handleSubmit} className="bg-surface-container rounded-[2rem] p-10 ambient-shadow space-y-8">
          
          <div className="space-y-2">
            <label className="text-label-md text-on-surface-variant">Título del Módulo</label>
            <input 
              type="text" 
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="w-full bg-surface-container-highest text-on-surface rounded-2xl px-6 py-4 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
              placeholder="Ej: Introducción a la Inteligencia Artificial"
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-md text-on-surface-variant">Descripción</label>
            <textarea 
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={4}
              className="w-full bg-surface-container-highest text-on-surface rounded-2xl px-6 py-4 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="Detalla los objetivos y temas del módulo..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-label-md text-on-surface-variant">Fecha de Inicio</label>
              <input 
                type="date" 
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                required
                className="w-full bg-surface-container-highest text-on-surface rounded-2xl px-6 py-4 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-label-md text-on-surface-variant">Fecha de Finalización</label>
              <input 
                type="date" 
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                required
                className="w-full bg-surface-container-highest text-on-surface rounded-2xl px-6 py-4 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* Docentes */}
            <div className="space-y-4">
              <label className="text-label-md text-on-surface-variant">Asignar Docentes</label>
              <div className="bg-surface-container-highest rounded-2xl p-4 border border-outline-variant/20 max-h-60 overflow-y-auto space-y-2">
                {docentesOptions.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant/50 p-2">No hay docentes registrados.</p>
                ) : (
                  docentesOptions.map(docente => (
                    <label key={docente.id} className="flex items-center gap-3 p-2 hover:bg-surface-variant/30 rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        value={docente.id}
                        checked={formData.docentes.includes(docente.id)}
                        onChange={(e) => handleCheckboxChange(e, "docentes")}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-body-md">{docente.nombres} {docente.apellidos}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Estudiantes */}
            <div className="space-y-4">
              <label className="text-label-md text-on-surface-variant">Matricular Estudiantes</label>
              <div className="bg-surface-container-highest rounded-2xl p-4 border border-outline-variant/20 max-h-60 overflow-y-auto space-y-2">
                {estudiantesOptions.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant/50 p-2">No hay estudiantes registrados.</p>
                ) : (
                  estudiantesOptions.map(estudiante => (
                    <label key={estudiante.id} className="flex items-center gap-3 p-2 hover:bg-surface-variant/30 rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        value={estudiante.id}
                        checked={formData.estudiantes.includes(estudiante.id)}
                        onChange={(e) => handleCheckboxChange(e, "estudiantes")}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-body-md">{estudiante.nombres} {estudiante.apellidos}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-outline-variant/10 flex justify-end gap-4">
            <button 
              type="button"
              onClick={() => router.push("/welcome/administrador/modulos")}
              className="btn-secondary py-4 px-8 rounded-full"
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="btn-primary py-4 px-8 rounded-full flex items-center gap-2"
              disabled={loading}
            >
              <Save className="w-5 h-5" />
              <span>{loading ? "Guardando..." : "Crear Módulo"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
