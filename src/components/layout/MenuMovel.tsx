'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Marca } from '@/components/layout/Marca';
import { Navegacao } from '@/components/layout/Navegacao';
import { BotaoSairCompacto } from '@/components/layout/ControlesSessao';
import { Button } from '@/components/ui/button';

export function MenuMovel({ nomeUsuario }: { nomeUsuario: string }) {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="border-b border-estrutura/20 bg-papel lg:hidden">
      <div className="flex items-center justify-between px-5 py-3">
        <Link href="/dashboard" className="inline-flex min-h-11 items-center">
          <Marca />
        </Link>
        <Button
          type="button"
          variant="secundario"
          tamanho="curto"
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={aberto}
          onClick={() => setAberto((valor) => !valor)}
        >
          {aberto ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </Button>
      </div>

      {aberto && (
        <div className="border-t border-estrutura/16 bg-papel px-5 py-4">
          <Navegacao onNavegar={() => setAberto(false)} />
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-estrutura/16 pt-4">
            <div className="min-w-0">
              <p className="font-dados text-[11px] text-estrutura">Organizador</p>
              <p className="truncate text-sm font-medium text-tinta">{nomeUsuario}</p>
            </div>
            <BotaoSairCompacto />
          </div>
        </div>
      )}
    </header>
  );
}
