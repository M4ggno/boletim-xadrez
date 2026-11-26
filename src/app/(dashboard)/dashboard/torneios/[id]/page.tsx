import type { Metadata } from 'next';
import { DetalheTorneio } from '@/components/torneios/DetalheTorneio';
import { TituloPagina } from '@/components/layout/TituloPagina';
import { exigirPaginaPrivada } from '@/lib/guards-pagina';
import Torneio from '@/models/Torneio';

export const metadata: Metadata = { title: 'Detalhe do torneio' };

export default async function PaginaDetalheTorneio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exigirPaginaPrivada(Torneio, id);

  return (
    <div className="space-y-6">
      <TituloPagina titulo="Detalhe do torneio" descricao="Inscrições, rodadas e classificação em um só boletim." />
      <DetalheTorneio id={id} />
    </div>
  );
}
