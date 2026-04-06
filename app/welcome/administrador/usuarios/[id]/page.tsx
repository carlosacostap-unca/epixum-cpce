"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import pb from "@/lib/pocketbase";
import { ArrowLeft, Save, User as UserIcon, Shield } from "lucide-react";
import { dateToUTCString, utcToLocalDateString } from "@/lib/utils/dateHelpers";

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState(""); // El email no se edita aquí, viene de Google
  const [avatar, setAvatar] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    dni: "",
    fecha_nacimiento: "",
    telefono: "",
    rol: "Estudiante", // Valor por defecto
  });

  useEffect(() => {
    if (!pb.authStore.isValid || pb.authStore.model?.rol !== "Administrador") {
      router.push("/");
      return;
    }
    
    if (userId) {
      cargarUsuario();
    }
  }, [router, userId]);

  const cargarUsuario = async () => {
    try {
      setLoading(true);
      const user = await pb.collection("users").getOne(userId);
      
      setEmail(user.email);
      if (user.avatar) {
        setAvatar(pb.files.getURL(user, user.avatar));
      }

      setFormData({
        nombres: user.nombres || user.name || "",
        apellidos: user.apellidos || "",
        dni: user.dni || "",
        fecha_nacimiento: user.fecha_nacimiento ? utcToLocalDateString(user.fecha_nacimiento) : "",
        telefono: user.telefono || "",
        rol: user.rol || "Estudiante",
      });

    } catch (error) {
      console.error("Error al cargar usuario:", error);
      alert("No se pudo cargar el usuario. Quizás fue eliminado.");
      router.push("/welcome/administrador/usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validar si un administrador se está quitando su propio rol (Peligroso)
      if (pb.authStore.model?.id === userId && formData.rol !== "Administrador") {
        const confirmar = window.confirm("ATENCIÓN: Te estás quitando tu propio rol de Administrador. Si continúas, perderás acceso a este panel inmediatamente. ¿Estás seguro?");
        if (!confirmar) {
          setSaving(false);
          return;
        }
      }

      const dataToSave = {
        ...formData,
        fecha_nacimiento: formData.fecha_nacimiento ? dateToUTCString(formData.fecha_nacimiento) : "",
      };

      await pb.collection("users").update(userId, dataToSave);
      router.push("/welcome/administrador/usuarios");
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      alert("Hubo un error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-on-surface-variant">
        Cargando información del usuario...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface p-10 md:p-20">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.push("/welcome/administrador/usuarios")}
          className="flex items-center gap-2 text-primary mb-8 hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-label-sm uppercase tracking-widest">Volver al Directorio</span>
        </button>
        
        <h1 className="text-display-md mb-10 flex items-center gap-4">
          Editar Usuario
        </h1>

        <form onSubmit={handleSubmit} className="bg-surface-container rounded-[2rem] p-10 ambient-shadow space-y-8">
          
          {/* Cabecera del Perfil (No editable, solo visual) */}
          <div className="flex items-center gap-6 p-6 bg-surface-container-highest rounded-2xl border border-outline-variant/10">
            <div className="w-20 h-20 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border-2 border-outline-variant/20">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 text-on-surface-variant" />
              )}
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant mb-1 uppercase tracking-widest">Cuenta de Google</p>
              <p className="text-title-lg truncate max-w-[200px] sm:max-w-sm">{email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-label-md text-on-surface-variant">Nombres</label>
              <input 
                type="text" 
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
                className="w-full bg-surface-container-highest text-on-surface rounded-2xl px-6 py-4 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-label-md text-on-surface-variant">Apellidos</label>
              <input 
                type="text" 
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
                className="w-full bg-surface-container-highest text-on-surface rounded-2xl px-6 py-4 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-label-md text-on-surface-variant">DNI</label>
              <input 
                type="text" 
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                required
                className="w-full bg-surface-container-highest text-on-surface rounded-2xl px-6 py-4 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-label-md text-on-surface-variant">Fecha de Nacimiento</label>
              <input 
                type="date" 
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                required
                className="w-full bg-surface-container-highest text-on-surface rounded-2xl px-6 py-4 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-label-md text-on-surface-variant">Teléfono</label>
              <input 
                type="tel" 
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="w-full bg-surface-container-highest text-on-surface rounded-2xl px-6 py-4 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            
            {/* Rol - Destacado */}
            <div className="space-y-2 bg-primary/5 p-4 rounded-2xl border border-primary/20">
              <label className="text-label-md text-primary flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Rol de Plataforma
              </label>
              <select 
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="w-full bg-surface-container-highest text-on-surface rounded-xl px-6 py-3 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none"
              >
                <option value="Estudiante">Estudiante</option>
                <option value="Docente">Docente</option>
                <option value="Nodocente">Nodocente</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-outline-variant/10 flex justify-end gap-4">
            <button 
              type="button"
              onClick={() => router.push("/welcome/administrador/usuarios")}
              className="btn-secondary py-4 px-8 rounded-full"
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="btn-primary py-4 px-8 rounded-full flex items-center gap-2"
              disabled={saving}
            >
              <Save className="w-5 h-5" />
              <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
