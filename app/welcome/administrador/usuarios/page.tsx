"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { ArrowLeft, Search, User as UserIcon, Shield, Mail } from "lucide-react";

interface Usuario {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  rol: string;
  avatar?: string;
  name?: string; // Por si viene de Google sin onboarding
}

export default function UsuariosAdminPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!pb.authStore.isValid || pb.authStore.model?.rol !== "Administrador") {
      router.push("/");
      return;
    }
    cargarUsuarios();
  }, [router]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const records = await pb.collection("users").getFullList({
        sort: "-created",
      });
      setUsuarios(records as unknown as Usuario[]);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado simple por nombre, apellido, email o rol
  const usuariosFiltrados = usuarios.filter(u => {
    const term = searchTerm.toLowerCase();
    const fullName = `${u.nombres || ''} ${u.apellidos || ''} ${u.name || ''}`.toLowerCase();
    return fullName.includes(term) || 
           u.email.toLowerCase().includes(term) || 
           (u.rol && u.rol.toLowerCase().includes(term));
  });

  const getRoleColor = (rol: string) => {
    switch (rol) {
      case "Administrador": return "bg-error/20 text-error";
      case "Docente": return "bg-primary/20 text-primary";
      case "Nodocente": return "bg-tertiary/20 text-tertiary";
      default: return "bg-surface-variant text-on-surface-variant"; // Estudiante u otros
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface p-10 md:p-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-12">
        <div className="max-w-2xl">
          <button 
            onClick={() => router.push("/welcome/administrador")}
            className="flex items-center gap-2 text-primary mb-8 hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-label-sm uppercase tracking-widest">Volver al Panel</span>
          </button>
          
          <h1 className="text-display-lg leading-tight">
            Directorio de <br />
            <span className="text-primary">Usuarios.</span>
          </h1>
        </div>

        <div className="w-full md:w-96 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o rol..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-container rounded-full py-4 pl-12 pr-6 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors text-body-lg"
          />
        </div>
      </div>

      {/* Lista de Usuarios */}
      {loading ? (
        <div className="text-on-surface-variant text-center py-20">Cargando usuarios...</div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="bg-surface-container rounded-[2rem] p-20 text-center border border-outline-variant/15">
          <p className="text-title-lg mb-2">No se encontraron usuarios</p>
          <p className="text-body-lg text-on-surface-variant">
            Prueba ajustando los términos de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {usuariosFiltrados.map((user) => (
            <div key={user.id} className="bg-surface-container hover:bg-surface-container-highest transition-colors rounded-[2rem] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-outline-variant/10 ambient-shadow">
              
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center shrink-0 overflow-hidden">
                  {user.avatar ? (
                    <img src={pb.files.getURL(user, user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-on-surface-variant" />
                  )}
                </div>
                
                <div className="truncate">
                  <h3 className="text-title-md truncate">
                    {user.nombres ? `${user.nombres} ${user.apellidos}` : user.name || "Sin Nombre"}
                  </h3>
                  <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mt-1 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                <div className={`px-3 py-1 rounded-full text-label-sm flex items-center gap-1.5 ${getRoleColor(user.rol)}`}>
                  {user.rol === "Administrador" && <Shield className="w-3 h-3" />}
                  {user.rol || "Sin Rol"}
                </div>
                
                <button 
                  onClick={() => router.push(`/welcome/administrador/usuarios/${user.id}`)}
                  className="btn-secondary py-2 px-6 rounded-full text-label-md"
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
