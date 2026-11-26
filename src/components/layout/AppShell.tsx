'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, LogOut, Menu, Swords, Trophy, Users, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Marca } from '@/components/layout/Marca';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUI } from '@/store/ui';

const itens = [
  { href: '/dashboard', rotulo: 'Visão geral', icone: LayoutDashboard },
  { href: '/dashboard/jogadores', rotulo: 'Jogadores', icone: Users },
  { href: '/dashboard/torneios', rotulo: 'Torneios', icone: Trophy },
  { href: '/dashboard/partidas', rotulo: 'Partidas', icone: Swords },
];

function Navegacao({ onNavegar }: { onNavegar?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-1">
      {itens.map(({ href, rotulo, icone: Icone }) => {
        const ativo =
          href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavegar}
            aria-current={ativo ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-11 items-center gap-3 rounded-sm px-3.5 text-sm font-medium transition-colors',
              ativo
                ? 'bg-acao text-white'
                : 'text-estrutura hover:bg-superficie hover:text-tinta',
            )}
          >
            <Icone size={18} strokeWidth={1.75} aria-hidden="true" />
            {rotulo}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  nomeUsuario,
}: {
  children: ReactNode;
  nomeUsuario: string;
}) {
  const [menuAberto, setMenuAberto] = useState(false);
  const titulo = useUI((estado) => estado.titulo);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <header className="border-b border-estrutura/20 bg-papel lg:hidden">
        <div className="flex items-center justify-between px-5 py-3">
          <Link href="/dashboard" className="inline-flex min-h-11 items-center">
            <Marca />
          </Link>
          <Button
            type="button"
            variant="secundario"
            tamanho="curto"
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto((valor) => !valor)}
          >
            {menuAberto ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </Button>
        </div>

        {menuAberto && (
          <div className="border-t border-estrutura/16 bg-papel px-5 py-4">
            <Navegacao onNavegar={() => setMenuAberto(false)} />
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-estrutura/16 pt-4">
              <div className="min-w-0">
                <p className="font-dados text-[11px] text-estrutura">Organizador</p>
                <p className="truncate text-sm font-medium text-tinta">{nomeUsuario}</p>
              </div>
              <Button
                type="button"
                variant="terciario"
                tamanho="curto"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-estrutura hover:text-erro"
              >
                <LogOut size={16} aria-hidden="true" />
                Sair
              </Button>
            </div>
          </div>
        )}
      </header>

      <aside className="hidden w-64 shrink-0 flex-col border-r border-estrutura/20 bg-papel px-5 py-6 lg:flex">
        <Link href="/dashboard" className="inline-flex min-h-11 items-center">
          <Marca comSubtitulo />
        </Link>
        <div className="regua-boletim my-5" aria-hidden="true" />
        <Navegacao />
        <div className="mt-auto border-t border-estrutura/18 pt-5">
          <p className="font-dados text-[11px] text-estrutura">Organizador</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-tinta">{nomeUsuario}</p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-sm px-2 -ml-2 text-sm font-medium text-estrutura transition-colors hover:bg-erro/10 hover:text-erro"
          >
            <LogOut size={16} aria-hidden="true" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
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
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
