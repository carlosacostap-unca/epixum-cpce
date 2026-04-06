"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { LogOut, LayoutDashboard, Users, BookOpen, Settings } from "lucide-react";

export default function AdministradorWelcomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push("/");
    } else {
      const user = pb.authStore.model;
      if (user) {
        // Doble validación de rol
        if (user.rol !== "Administrador") {
          router.push("/welcome/estudiante");
        }
        setUserName(user.nombres || user.name || "Administrador");
      }
    }
  }, [router]);

  const handleLogout = () => {
    pb.authStore.clear();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* Navigation Rail (Glassmorphism) */}
      <nav className="fixed left-6 top-6 bottom-6 w-20 bg-surface-variant/40 backdrop-blur-[20px] rounded-full flex flex-col items-center py-10 gap-10 z-50">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-auto">
          <LayoutDashboard className="w-5 h-5" />
        </div>
        
        <div className="flex flex-col gap-8">
          <button className="text-primary hover:text-primary transition-colors">
            <LayoutDashboard className="w-6 h-6" />
          </button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors">
            <Users className="w-6 h-6" />
          </button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors">
            <BookOpen className="w-6 h-6" />
          </button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="text-on-surface-variant hover:text-primary transition-colors mt-auto"
          title="Cerrar Sesión"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 ml-32 p-10 md:p-20">
        {/* Asymmetric Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-20 mb-20">
          <div className="max-w-2xl">
            <p className="text-label-md text-primary tracking-widest uppercase mb-4">
              Panel de Administración
            </p>
            <h1 className="text-display-lg leading-tight">
              Visión General,<br />
              <span className="text-on-surface-variant">{userName}.</span>
            </h1>
          </div>
          
          <div className="bg-surface-container-low rounded-xl p-8 max-w-sm hidden lg:block">
            <p className="text-body-lg text-on-surface-variant">
              Gestión centralizada de la Diplomatura Universitaria. Supervisa estudiantes, docentes y módulos desde este panel.
            </p>
          </div>
        </div>

        {/* Content Section - Cards without lines */}
        <section>
          <h2 className="text-headline-sm mb-10">Métricas Principales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="bg-surface-container-highest rounded-[2rem] p-8 flex flex-col h-full ambient-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -mr-10 -mt-10"></div>
              <div className="mb-6 flex-1 relative z-10">
                <span className="text-label-sm text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 inline-block">
                  Activos
                </span>
                <h3 className="text-title-lg mb-2">Total de Estudiantes</h3>
                <p className="text-display-md text-primary mt-4">
                  142
                </p>
                <p className="text-body-lg text-on-surface-variant mt-2">
                  +12% respecto al mes anterior.
                </p>
              </div>
              
              <button 
                onClick={() => router.push('/welcome/administrador/usuarios')}
                className="btn-primary w-full py-4 rounded-full text-title-sm cursor-pointer relative z-10"
              >
                Gestionar Usuarios
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-container rounded-[2rem] p-8 flex flex-col h-full">
              <div className="mb-6 flex-1">
                <span className="text-label-sm text-tertiary bg-tertiary/10 px-3 py-1 rounded-full mb-4 inline-block">
                  Contenido Educativo
                </span>
                <h3 className="text-title-lg mb-2">Módulos de la Diplomatura</h3>
                <p className="text-display-md text-tertiary mt-4">
                  --
                </p>
                <p className="text-body-lg text-on-surface-variant mt-2">
                  Gestión de programas, fechas, docentes y alumnos asignados.
                </p>
              </div>
              
              <button 
                onClick={() => router.push('/welcome/administrador/modulos')}
                className="btn-secondary w-full py-4 rounded-full text-title-sm cursor-pointer"
              >
                Gestionar Módulos
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-container-low rounded-[2rem] p-8 flex flex-col h-full opacity-90 hover:opacity-100 transition-opacity">
              <div className="mb-6 flex-1">
                <span className="text-label-sm text-on-surface-variant bg-surface-variant px-3 py-1 rounded-full mb-4 inline-block">
                  Sistema
                </span>
                <h3 className="text-title-lg mb-2">Estado de la Plataforma</h3>
                <p className="text-display-sm text-on-surface mt-4">
                  Óptimo
                </p>
                <p className="text-body-lg text-on-surface-variant mt-2">
                  Base de datos y servicios sincronizados.
                </p>
              </div>
              
              <button className="bg-surface-container-highest text-on-surface w-full py-4 rounded-full text-title-sm cursor-pointer">
                Ver Logs
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
