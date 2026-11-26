import type { ReactNode } from 'react';
import Link from 'next/link';
import { Marca } from '@/components/layout/Marca';
import { LinkButton } from '@/components/ui/link-button';

export default function LayoutPublico({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-papel">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="inline-flex min-h-11 items-center">
            <Marca />
          </Link>
          <nav aria-label="Acesso" className="flex items-center gap-2 sm:gap-3">
            <LinkButton href="/login" variant="terciario">
              Entrar
            </LinkButton>
            <LinkButton href="/registrar" variant="secundario">
              Criar conta
            </LinkButton>
          </nav>
        </div>
        <div className="regua-boletim" aria-hidden="true" />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-12 sm:py-16">
        {children}
      </main>

      <footer className="border-t border-estrutura/18 bg-papel/80">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4 text-sm text-estrutura">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center font-medium text-acao hover:underline"
          >
            Voltar à página inicial
          </Link>
          <span className="font-dados text-xs text-estrutura">Boletim de xadrez</span>
        </div>
      </footer>
    </div>
  );
}
