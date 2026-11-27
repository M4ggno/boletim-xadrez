'use client';

import Link from 'next/link';
import { Swords, Trophy, Users } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { queryKeys } from '@/services/queryKeys';
import { Card, CardContent } from '@/components/ui/card';
import { Carregando, Erro } from '@/components/ui/estados';
import type { ListaDTO, PartidaDTO, TorneioDTO, JogadorDTO } from '@/types/dtos';

export function Resumo() {
  const jogadores = useApiQuery<ListaDTO<JogadorDTO>>(queryKeys.jogadores.todos, '/jogadores');
  const torneios = useApiQuery<ListaDTO<TorneioDTO>>(queryKeys.torneios.todos, '/torneios');
  const partidas = useApiQuery<ListaDTO<PartidaDTO>>(queryKeys.partidas.todos, '/partidas');

  if (jogadores.isPending || torneios.isPending || partidas.isPending) return <Carregando />;
  if (jogadores.isError || torneios.isError || partidas.isError) {
    return <Erro mensagem="Não foi possível carregar o resumo." onTentarNovamente={() => {
      void jogadores.refetch();
      void torneios.refetch();
      void partidas.refetch();
    }} />;
  }

  const pendentes = partidas.data?.itens.filter((partida) => partida.resultado === 'Pendente').length ?? 0;
  const emAndamento = torneios.data?.itens.filter((torneio) => torneio.status === 'Em andamento').length ?? 0;

  const cartoes = [
    { rotulo: 'Jogadores', valor: jogadores.data?.total ?? 0, href: '/dashboard/jogadores', icone: Users },
    { rotulo: 'Torneios em andamento', valor: emAndamento, href: '/dashboard/torneios', icone: Trophy },
    { rotulo: 'Partidas sem resultado', valor: pendentes, href: '/dashboard/partidas', icone: Swords },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cartoes.map(({ rotulo, valor, href, icone: Icone }) => (
        <Link key={rotulo} href={href} className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao">
          <Card className="h-full transition-colors hover:border-acao">
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-estrutura/85">{rotulo}</p>
                <p className="mt-1 font-dados text-3xl font-semibold tabular-nums">{valor}</p>
              </div>
              <Icone size={28} strokeWidth={1.5} className="text-acao" aria-hidden="true" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
