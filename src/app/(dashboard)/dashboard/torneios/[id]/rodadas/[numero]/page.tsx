import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PaginaRodada } from '@/components/partidas/PaginaRodada';
import { TituloPagina } from '@/components/layout/TituloPagina';
import { exigirSessao } from '@/lib/guards';
import { exigirPaginaPrivada } from '@/lib/guards-pagina';
import Rodada from '@/models/Rodada';
import Torneio from '@/models/Torneio';
import { dbConnect } from '@/lib/db';
import { Types } from 'mongoose';

export const metadata: Metadata = { title: 'Rodada' };

export default async function PaginaDetalheRodada({
  params,
}: {
  params: Promise<{ id: string; numero: string }>;
}) {
  const { id, numero } = await params;
  const numeroRodada = Number(numero);

  if (!Number.isInteger(numeroRodada) || numeroRodada < 1) {
    notFound();
  }

  await exigirPaginaPrivada(Torneio, id);
  const usuarioId = await exigirSessao();
  await dbConnect();
  const rodada = await Rodada.findOne({
    torneioId: new Types.ObjectId(id),
    numero: numeroRodada,
    usuarioId: new Types.ObjectId(usuarioId),
  }).select('_id');

  if (!rodada) notFound();

  return (
    <div className="space-y-6">
      <TituloPagina titulo={`Rodada ${numeroRodada}`} descricao="Registre o resultado de cada partida." />
      <PaginaRodada torneioId={id} numero={numeroRodada} />
    </div>
  );
}
