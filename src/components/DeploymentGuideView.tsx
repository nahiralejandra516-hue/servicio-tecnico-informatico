import React, { useState } from 'react';
import { 
  Github, 
  Cloud, 
  Terminal, 
  Copy, 
  Check, 
  CheckCircle2, 
  ExternalLink,
  Presentation,
  ShieldAlert
} from 'lucide-react';

export const DeploymentGuideView: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCommand = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const gitCommands = `git init
git add .
git commit -m "Proyecto Servicio Tecnico Informatico con Supabase"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/servicio-tecnico-colegio.git
git push -u origin main`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
          <Github className="w-3.5 h-3.5" />
          <span>Guía de Entrega Escolar</span>
          <span aria-hidden="true">·</span>
          <span>GitHub & Render</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Cómo Subir tu Proyecto a GitHub y Render
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Sigue esta guía paso a paso para publicar el código en GitHub y desplegar la aplicación web en vivo en Render para tu entrega.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* PARTE 1: GITHUB */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Paso 1: Subir el Código a GitHub
              </h2>
              <p className="text-xs text-slate-500">
                Control de versiones y repositorio público/privado
              </p>
            </div>
          </div>

          <ol className="text-xs text-slate-700 space-y-3 list-decimal list-inside leading-relaxed">
            <li>
              Entra en <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-sky-700 font-semibold underline">github.com/new</a> y crea un nuevo repositorio (por ejemplo: <code>servicio-tecnico-escolar</code>).
            </li>
            <li>
              Abre una terminal en la carpeta de tu proyecto en tu computadora y ejecuta estos comandos:
            </li>
          </ol>

          <div className="relative bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
            <button
              onClick={() => copyCommand(gitCommands, 1)}
              className="absolute right-3 top-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 transition-colors"
            >
              {copiedIndex === 1 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedIndex === 1 ? 'Copiado' : 'Copiar'}</span>
            </button>
            <pre className="whitespace-pre">{gitCommands}</pre>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-medium">
            ¡Listo! Todo tu proyecto estará publicado en GitHub con tu historial de commits.
          </div>
        </div>

        {/* PARTE 2: RENDER */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Paso 2: Desplegar la Web en Render
              </h2>
              <p className="text-xs text-slate-500">
                Alojamiento en la nube gratuito y continuo
              </p>
            </div>
          </div>

          <ol className="text-xs text-slate-700 space-y-3 list-decimal list-inside leading-relaxed">
            <li>
              Ingresa a <a href="https://render.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold underline">render.com</a> y regístrate gratis con tu cuenta de GitHub.
            </li>
            <li>
              Haz clic en <strong>+ New</strong> y selecciona <strong>Static Site</strong> (o <strong>Web Service</strong> si usas el backend Express).
            </li>
            <li>
              Conecta tu repositorio de GitHub que subiste en el paso anterior.
            </li>
            <li>
              Configura los siguientes campos de compilación:
              <div className="mt-2 space-y-1.5 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px]">
                <div><strong>Build Command:</strong> <code>npm run build</code></div>
                <div><strong>Publish Directory:</strong> <code>dist</code></div>
              </div>
            </li>
            <li>
              En la sección <strong>Environment Variables</strong> añade las claves de Supabase:
              <div className="mt-2 space-y-1 p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px]">
                <div><code>VITE_SUPABASE_URL</code> = <em>tu url de supabase</em></div>
                <div><code>VITE_SUPABASE_ANON_KEY</code> = <em>tu clave pública anon</em></div>
              </div>
            </li>
            <li>
              Haz clic en <strong>Create Static Site</strong>. Render compilará tu aplicación y te dará una URL pública tipo <code>https://tu-proyecto.onrender.com</code>.
            </li>
          </ol>
        </div>

      </div>

      {/* Consejos para la defensa del proyecto ante los profesores */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Presentation className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-slate-900">
            Guía para Defender el Proyecto ante tus Profesores
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <strong className="text-slate-900 font-bold block text-sm">
              1. Demostrar la Regla #1
            </strong>
            <p>
              Toma una orden en estado "Recibido", haz clic en "Reparar" e intenta pasarla a <em>En Reparación</em> sin diagnóstico o con costo $0.
            </p>
            <div className="text-[11px] text-amber-800 font-semibold">
              El sistema mostrará el aviso en rojo explicando que el diagnóstico técnico y el costo &gt; $0 son obligatorios.
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <strong className="text-slate-900 font-bold block text-sm">
              2. Demostrar la Regla #2
            </strong>
            <p>
              Intenta entregar un equipo que está "En Diagnóstico" o "En Reparación" haciendo clic en "Entregar".
            </p>
            <div className="text-[11px] text-emerald-800 font-semibold">
              El sistema rechazará la acción informando que el equipo primero debe figurar como Reparado y verificado.
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <strong className="text-slate-900 font-bold block text-sm">
              3. Demostrar Restricciones UNIQUE
            </strong>
            <p>
              Intenta dar de alta a un cliente con el mismo DNI de otro o un equipo con el mismo número de serie.
            </p>
            <div className="text-[11px] text-sky-800 font-semibold">
              Se rechaza por la restricción de integridad UNIQUE tanto en frontend como en PostgreSQL.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
