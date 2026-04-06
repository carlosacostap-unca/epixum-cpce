/**
 * Convierte un string de fecha local (ej: "1990-05-15") a un string ISO UTC 0.
 * Asegura que la fecha guardada sea exactamente el inicio del día en la zona horaria del usuario,
 * pero representada en UTC.
 */
export function dateToUTCString(localDateString: string): string {
  if (!localDateString) return "";
  
  // Al parsear "YYYY-MM-DD" sin hora, JavaScript puede asumir UTC o Local dependiendo del navegador.
  // Para evitar errores, creamos la fecha usando los componentes locales explícitamente.
  const [year, month, day] = localDateString.split("-").map(Number);
  
  // Creamos la fecha en la zona horaria local a las 00:00:00
  const localDate = new Date(year, month - 1, day);
  
  // Retornamos el string ISO en formato UTC (termina en 'Z')
  return localDate.toISOString();
}

/**
 * Convierte un string ISO UTC (de PocketBase) a un formato local "YYYY-MM-DD" 
 * para mostrar en inputs de tipo <input type="date">.
 */
export function utcToLocalDateString(utcDateString: string): string {
  if (!utcDateString) return "";
  
  const date = new Date(utcDateString);
  
  // Extraemos los componentes de la fecha usando la zona horaria local del navegador
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

/**
 * Convierte un string ISO UTC (de PocketBase) a un formato local "DD/MM/YYYY" 
 * para mostrar en la interfaz (solo lectura).
 */
export function formatDateToDDMMYYYY(utcDateString: string): string {
  if (!utcDateString) return "";
  
  const date = new Date(utcDateString);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  
  return `${day}/${month}/${year}`;
}

/**
 * Convierte un string de fecha y hora local (ej: "1990-05-15T14:30") a un string ISO UTC.
 */
export function dateTimeToUTCString(localDateTimeString: string): string {
  if (!localDateTimeString) return "";
  const date = new Date(localDateTimeString);
  return date.toISOString();
}

/**
 * Convierte un string ISO UTC (de PocketBase) a un formato local "YYYY-MM-DDTHH:mm" 
 * para inputs de tipo <input type="datetime-local">.
 */
export function utcToLocalDateTimeString(utcDateString: string): string {
  if (!utcDateString) return "";
  const date = new Date(utcDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Convierte un string ISO UTC a un formato local "DD/MM/YYYY a las HH:mm"
 * para mostrar en la interfaz.
 */
export function formatDateTimeToLocal(utcDateString: string): string {
  if (!utcDateString) return "";
  const date = new Date(utcDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  
  return `${day}/${month}/${year} a las ${hours}:${minutes} hs`;
}
