import type { Metadata } from 'next';
import { ListaJogadores } from '@/components/jogadores/ListaJogadores';
import { TituloPagina } from '@/components/layout/TituloPagina';

export const metadata: Metadata = { title: 'Jogadores' };

export default function PaginaJogadores() {
  return (
    <div className="space-y-6">
      <TituloPagina
        titulo="Jogadores"
        descricao="Fichas dos enxadristas do clube. Cada jogador pertence apenas à sua conta."
      />
      <ListaJogadores />
    </div>
  );
}
