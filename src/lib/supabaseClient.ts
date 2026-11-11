import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'tecnifix_supabase_url';
const STORAGE_KEY_ANON_KEY = 'tecnifix_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  // Check env vars first, then localStorage
  const envUrl = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON_KEY) || '' : '';

  return {
    url: localUrl || envUrl,
    anonKey: localKey || envKey,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (anonKey) localStorage.setItem(STORAGE_KEY_ANON_KEY, anonKey.trim());
    else localStorage.removeItem(STORAGE_KEY_ANON_KEY);
  }
  cachedClient = null;
  cachedUrl = '';
  cachedKey = '';
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) {
    return null;
  }

  if (cachedClient && cachedUrl === url && cachedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey);
    cachedUrl = url;
    cachedKey = anonKey;
    return cachedClient;
  } catch (error) {
    console.error('Error al inicializar cliente Supabase:', error);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string; tablesFound?: string[] }> {
  try {
    if (!url || !anonKey) {
      return { success: false, message: 'Debes ingresar la URL del proyecto y la Anon Public Key de Supabase.' };
    }
    const testClient = createClient(url, anonKey);
    const { data: clientes, error: errCli } = await testClient.from('clientes').select('id').limit(1);

    if (errCli) {
      if (errCli.code === 'PGRST204' || errCli.message.includes('relation') || errCli.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Se conectó con Supabase pero las tablas aún no existen. Ejecuta primero el script SQL en el SQL Editor de Supabase.',
        };
      }
      return {
        success: false,
        message: `Error al conectar con Supabase: ${errCli.message}`,
      };
    }

    return {
      success: true,
      message: '¡Conexión exitosa con Supabase! Las tablas existen y están listas para operar.',
      tablesFound: ['clientes', 'equipos', 'ordenes'],
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `No se pudo conectar a Supabase: ${errorMsg}`,
    };
  }
}
