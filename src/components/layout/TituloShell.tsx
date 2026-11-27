'use client';

import { useUI } from '@/store/ui';

export function TituloShell({ nomeUsuario }: { nomeUsuario: string }) {
  const titulo = useUI((estado) => estado.titulo);

  return (
    <header className="border-b border-estrutura/20 bg-papel px-6 py-4">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <h1 className="truncate font-titulo text-xl font-bold text-tinta sm:text-2xl">
          {titulo}
        </h1>
        <span className="hidden font-dados text-xs text-estrutura sm:inline">
          {nomeUsuario}
        </span>
      </div>
    </header>
  );
}
