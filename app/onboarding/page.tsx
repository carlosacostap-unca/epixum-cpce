"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { dateToUTCString } from "@/lib/utils/dateHelpers";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    apellidos: "",
    nombres: "",
    dni: "",
    fecha_nacimiento: "",
    telefono: "",
  });

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push("/");
    } else {
      const user = pb.authStore.model;
      if (user) {
        if (user.rol === "Administrador") {
          router.push("/welcome/administrador");
        } else if (user.rol === "Docente") {
          router.push("/welcome/docente");
        }
      }
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = pb.authStore.model;
      if (user) {
        // Convertimos la fecha local ingresada en el input (YYYY-MM-DD) a un string UTC
        // para asegurar que PocketBase (GMT 0) guarde el día correcto.
        const utcDateString = formData.fecha_nacimiento 
          ? dateToUTCString(formData.fecha_nacimiento) 
          : "";

        const dataToSave = {
          ...formData,
          fecha_nacimiento: utcDateString,
        };

        await pb.collection("users").update(user.id, dataToSave);
        router.push("/welcome/estudiante");
      }
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-20">
      <div className="w-full max-w-2xl bg-surface-container rounded-xl p-8 md:p-12 ghost-border ambient-shadow">
        <div className="mb-10">
          <h1 className="text-display-md mb-3">Completar Perfil</h1>
          <p className="text-body-lg text-on-surface-variant">
            Por favor, completa los siguientes datos para finalizar tu registro.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="nombres" className="text-label-sm">Nombres</label>
              <input
                type="text"
                id="nombres"
                name="nombres"
                required
                className="input-well"
                placeholder="Tus nombres"
                value={formData.nombres}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="apellidos" className="text-label-sm">Apellidos</label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                required
                className="input-well"
                placeholder="Tus apellidos"
                value={formData.apellidos}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="dni" className="text-label-sm">DNI</label>
              <input
                type="text"
                id="dni"
                name="dni"
                required
                className="input-well"
                placeholder="Número de documento"
                value={formData.dni}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="fecha_nacimiento" className="text-label-sm">Fecha de Nacimiento</label>
              <input
                type="date"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                required
                className="input-well"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="telefono" className="text-label-sm">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                required
                className="input-well"
                placeholder="Ej. +54 9 11..."
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full cursor-pointer"
            >
              {loading ? "Guardando..." : "Finalizar Registro"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}