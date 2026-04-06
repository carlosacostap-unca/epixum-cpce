"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import pb from "@/lib/pocketbase";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si ya está logueado, redirigir
    if (pb.authStore.isValid) {
      checkUserOnboarding();
    }
  }, []);

  const checkUserOnboarding = async (authData?: any) => {
    try {
      const user = pb.authStore.model;
      if (!user) return;

      // Actualizar el avatar de Google si está disponible en authData
      if (authData?.meta?.avatarUrl) {
        try {
          const avatarUrl = authData.meta.avatarUrl;
          // Pasamos por nuestro proxy para evitar problemas de CORS con la imagen de Google
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(avatarUrl)}`;
          const response = await fetch(proxyUrl);
          
          if (response.ok) {
            const blob = await response.blob();
            const formData = new FormData();
            formData.append('avatar', blob, 'avatar.png');
            
            // Actualizamos solo el avatar en background
            await pb.collection("users").update(user.id, formData);
            // Refrescamos el usuario actual en el store
            await pb.collection("users").getOne(user.id);
          }
        } catch (error) {
          console.error("Error al actualizar avatar:", error);
        }
      }

      if (user.rol === "Administrador") {
        router.push("/welcome/administrador");
        return;
      }

      if (user.rol === "Docente") {
        router.push("/welcome/docente");
        return;
      }

      if (authData?.meta?.isNew) {
        // Es un usuario nuevo. Le asignamos rol Estudiante
        await pb.collection("users").update(user.id, { rol: "Estudiante" });

        // Intentar asignarlo automáticamente al primer módulo usando la API del servidor (Admin Auth)
        try {
          await fetch("/api/assign-first-module", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: user.id }),
          });
        } catch (apiError) {
          console.error("Error al llamar a la API de asignación:", apiError);
        }

        // Lo mandamos al onboarding
        router.push("/onboarding");
      } else {
        // Usuario existente: No mostramos formulario, va directo a la bienvenida
        router.push("/welcome/estudiante");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const authData = await pb.collection("users").authWithOAuth2({ provider: "google" });
      await checkUserOnboarding(authData);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 md:p-20">
      <div className="w-full max-w-[1200px] flex flex-col md:flex-row items-center justify-between gap-20">
        {/* Lado izquierdo: Título Asimétrico */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-12 mb-8 opacity-90">
            <Image 
              src="/logo_ftyca_blanco.png" 
              alt="Logo FTyCA" 
              width={280} 
              height={280} 
              className="h-32 w-auto object-contain"
              priority
            />
            <Image 
              src="/logo_cpce_blanco.png" 
              alt="Logo CPCE" 
              width={280} 
              height={280} 
              className="h-32 w-auto object-contain"
              priority
            />
          </div>
          <h1 className="text-display-md text-primary max-w-2xl">
            Diplomatura Universitaria de Posgrado en Gestión Inteligente de Transformación Digital con Inteligencia Artificial Generativa
          </h1>
        </div>

        {/* Lado derecho: Tarjeta de Login */}
        <div className="w-full max-w-md bg-surface-container rounded-xl p-8 md:p-12 ghost-border ambient-shadow">
          <div className="space-y-10">
            <div>
              <h2 className="text-headline-sm mb-3">Iniciar Sesión</h2>
              <p className="text-body-lg text-on-surface-variant">
                Utiliza tu cuenta de Google corporativa para acceder al sistema.
              </p>
            </div>
            
            <button
              onClick={loginWithGoogle}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-3 cursor-pointer"
            >
              <LogIn className="w-5 h-5" />
              {loading ? "Conectando..." : "Ingresar con Google"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}