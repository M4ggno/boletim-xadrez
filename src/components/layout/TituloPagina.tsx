'use client';

import { useEffect } from 'react';
import { useUI } from '@/store/ui';

export function TituloPagina({ titulo, descricao }: { titulo: string; descricao?: string }) {
  const definirTitulo = useUI((estado) => estado.definirTitulo);

  useEffect(() => {
    definirTitulo(titulo);
    return () => definirTitulo('Boletim');
  }, [titulo, definirTitulo]);

  return (
    <div>
      <h2 className="text-2xl font-bold sm:text-3xl">{titulo}</h2>
      {descricao && <p className="mt-2 max-w-[65ch] text-sm text-estrutura/85 sm:text-base">{descricao}</p>}
    </div>
  );
}
