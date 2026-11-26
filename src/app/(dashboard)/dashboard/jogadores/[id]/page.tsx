import type { Metadata } from 'next';
import { DetalheJogador } from '@/components/jogadores/DetalheJogador';
import { TituloPagina } from '@/components/layout/TituloPagina';
import { exigirPaginaPrivada } from '@/lib/guards-pagina';
import Jogador from '@/models/Jogador';

export const metadata: Metadata = { title: 'Ficha do jogador' };

export default async function PaginaDetalheJogador({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exigirPaginaPrivada(Jogador, id);

  return (
    <div className="space-y-6">
      <TituloPagina titulo="Ficha do jogador" descricao="Alterações ficam registradas apenas na ficha deste jogador." />
      <DetalheJogador id={id} />
    </div>
  );
}
