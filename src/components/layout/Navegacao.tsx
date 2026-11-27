'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Swords, Trophy, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const itens = [
  { href: '/dashboard', rotulo: 'Visão geral', icone: LayoutDashboard },
  { href: '/dashboard/jogadores', rotulo: 'Jogadores', icone: Users },
  { href: '/dashboard/torneios', rotulo: 'Torneios', icone: Trophy },
  { href: '/dashboard/partidas', rotulo: 'Partidas', icone: Swords },
];

export function Navegacao({ onNavegar }: { onNavegar?: () => void }) {
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
