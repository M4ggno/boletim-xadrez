import type { Metadata } from 'next';
import { ListaPartidas } from '@/components/partidas/ListaPartidas';
import { TituloPagina } from '@/components/layout/TituloPagina';

export const metadata: Metadata = { title: 'Partidas' };

export default function PaginaPartidas() {
  return (
    <div className="space-y-6">
      <TituloPagina
        titulo="Partidas"
        descricao="Lance resultados e acompanhe o efeito imediato na classificação."
      />
      <ListaPartidas />
    </div>
  );
}
