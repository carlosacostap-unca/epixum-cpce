import PocketBase from 'pocketbase';

// La URL se tomará de las variables de entorno (.env.local)
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

// Deshabilitar la cancelación automática para SSR/Next.js (opcional pero recomendado)
pb.autoCancellation(false);

export default pb;
