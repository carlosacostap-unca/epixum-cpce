"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { LogOut } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push("/");
    } else {
      const user = pb.authStore.model;
      if (user) {
        setUserName(user.nombres || user.name || "Estudiante");
      }
    }
  }, [router]);

  const handleLogout = () => {
    pb.authStore.clear();
    router.push("/");
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-20">
      <div className="w-full max-w-[1000px] flex flex-col md:flex-row items-center gap-20">
        <div className="flex-1 space-y-8">
          <p className="text-label-md text-primary">Bienvenido a la plataforma</p>
          <h1 className="text-display-md">
            Hola, <br />
            <span className="text-display-lg text-primary">{userName}</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-lg">
            Tu perfil ha sido completado con éxito. Ahora tienes acceso a todo el material educativo exclusivo.
          </p>

          <div className="pt-8">
            <button
              onClick={handleLogout}
              className="btn-ghost flex items-center gap-3 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="w-full md:w-auto bg-surface-container rounded-xl p-8 ghost-border ambient-shadow hidden md:block">
          <div className="w-[300px] h-[400px] bg-surface-container-highest rounded-lg flex items-center justify-center text-on-surface-variant">
            <p className="text-title-sm">Espacio para contenido</p>
          </div>
        </div>
      </div>
    </main>
  );
}