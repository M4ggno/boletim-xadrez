import Link from 'next/link';
import type { ReactNode } from 'react';
import { Marca } from '@/components/layout/Marca';
import { Navegacao } from '@/components/layout/Navegacao';
import { BotaoSairLateral } from '@/components/layout/ControlesSessao';
import { MenuMovel } from '@/components/layout/MenuMovel';
import { TituloShell } from '@/components/layout/TituloShell';

/**
 * Casca do painel. Apenas as folhas interativas são Client Components;
 * o conteúdo da rota permanece como Server Component.
 */
export function AppShell({
  children,
  nomeUsuario,
}: {
  children: ReactNode;
  nomeUsuario: string;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <MenuMovel nomeUsuario={nomeUsuario} />

      <aside className="hidden w-64 shrink-0 flex-col border-r border-estrutura/20 bg-papel px-5 py-6 lg:flex">
        <Link href="/dashboard" className="inline-flex min-h-11 items-center">
          <Marca comSubtitulo />
        </Link>
        <div className="regua-boletim my-5" aria-hidden="true" />
        <Navegacao />
        <div className="mt-auto border-t border-estrutura/18 pt-5">
          <p className="font-dados text-[11px] text-estrutura">Organizador</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-tinta">{nomeUsuario}</p>
          <BotaoSairLateral />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <TituloShell nomeUsuario={nomeUsuario} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
