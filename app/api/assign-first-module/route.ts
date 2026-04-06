import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId es requerido" }, { status: 400 });
    }

    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090");

    // Autenticarnos como admin usando variables de entorno
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("Faltan credenciales de administrador de PocketBase en el .env");
      return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 });
    }

    await pb.admins.authWithPassword(adminEmail, adminPassword);

    // Obtener el primer módulo
    const modulosResult = await pb.collection("modulos").getList(1, 1, {
      sort: "fecha_inicio",
    });
    
    if (modulosResult.items.length > 0) {
      const primerModulo = modulosResult.items[0];
      const estudiantesActuales = primerModulo.estudiantes || [];
      
      // Verificamos que no esté ya en la lista
      if (!estudiantesActuales.includes(userId)) {
        await pb.collection("modulos").update(primerModulo.id, {
          estudiantes: [...estudiantesActuales, userId],
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en API de asignación:", error);
    return NextResponse.json({ error: "Error al asignar módulo" }, { status: 500 });
  }
}