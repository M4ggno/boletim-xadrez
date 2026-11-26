import type { Metadata } from 'next';
import { ListaTorneios } from '@/components/torneios/ListaTorneios';
import { TituloPagina } from '@/components/layout/TituloPagina';

export const metadata: Metadata = { title: 'Torneios' };

export default function PaginaTorneios() {
  return (
    <div className="space-y-6">
      <TituloPagina
        titulo="Torneios"
        descricao="Abra inscrições, acompanhe as rodadas e publique o boletim final."
      />
      <ListaTorneios />
    </div>
  );
}
