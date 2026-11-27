'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BotaoSairCompacto() {
  return (
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
  );
}

export function BotaoSairLateral() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-sm px-2 -ml-2 text-sm font-medium text-estrutura transition-colors hover:bg-erro/10 hover:text-erro"
    >
      <LogOut size={16} aria-hidden="true" />
      Sair
    </button>
  );
}
