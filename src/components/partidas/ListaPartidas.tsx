'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApiQuery } from '@/hooks/useApiQuery';
import { queryKeys } from '@/services/queryKeys';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Carregando, Erro, Vazio } from '@/components/ui/estados';
import { Tabela, TBody, TD, TH, THead, TR } from '@/components/ui/tabela';
import { registrarResultadoAction } from '@/app/actions/partida-actions';
import { estadoInicialAcao } from '@/types/acoes';
import { RESULTADOS_PARTIDA } from '@/types/dominio';
import type { JogadorDTO, ListaDTO, PartidaDTO, TorneioDTO, RodadaDTO } from '@/types/dtos';

function FormularioResultado({ partida, onSalvo }: { partida: PartidaDTO; onSalvo: () => void }) {
  const [estado, acao, pendente] = useActionState(registrarResultadoAction, estadoInicialAcao);

  useEffect(() => {
    if (estado.mensagem) {
      toast.success(estado.mensagem);
      onSalvo();
    }
    if (estado.erro) toast.error(estado.erro);
  }, [estado.mensagem, estado.erro, onSalvo]);

  return (
    <form action={acao} className="flex items-center justify-end gap-2">
      <input type="hidden" name="id" value={partida.id} />
      <select
        name="resultado"
        defaultValue={partida.resultado}
        aria-label={`Resultado da partida ${partida.id}`}
        className="h-10 rounded-md border bg-transparent px-2 text-sm"
      >
        {RESULTADOS_PARTIDA.map((resultado) => (
          <option key={resultado} value={resultado}>{resultado}</option>
        ))}
      </select>
      <Button type="submit" tamanho="curto" disabled={pendente}>{pendente ? '…' : 'Salvar'}</Button>
    </form>
  );
}

export function ListaPartidas() {
  const queryClient = useQueryClient();
  const [filtroTorneio, setFiltroTorneio] = useState('');
  const sufixo = filtroTorneio ? `?torneioId=${filtroTorneio}` : '';
  const partidas = useApiQuery<ListaDTO<PartidaDTO>>(
    queryKeys.partidas.lista({ torneioId: filtroTorneio }),
    `/partidas${sufixo}`,
  );
  const torneios = useApiQuery<ListaDTO<TorneioDTO>>(queryKeys.torneios.todos, '/torneios');
  const jogadores = useApiQuery<ListaDTO<JogadorDTO>>(queryKeys.jogadores.todos, '/jogadores');
  const rodadas = useApiQuery<ListaDTO<RodadaDTO>>(queryKeys.rodadas.todos, '/rodadas');

  const nomes = new Map((jogadores.data?.itens ?? []).map((jogador) => [jogador.id, jogador.nome]));
  const numerosRodada = new Map((rodadas.data?.itens ?? []).map((rodada) => [rodada.id, rodada.numero]));

  async function excluir(partida: PartidaDTO) {
    if (!window.confirm('Remover esta partida?')) return;
    try {
      await api.delete(`/partidas/${partida.id}`);
      toast.success('Partida removida.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.partidas.todos });
      void queryClient.invalidateQueries({ queryKey: queryKeys.classificacao(partida.torneioId) });
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível remover.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={filtroTorneio}
          onChange={(evento) => setFiltroTorneio(evento.target.value)}
          aria-label="Filtrar por torneio"
          className="h-11 w-full rounded-md border bg-transparent px-3 text-base sm:max-w-sm"
        >
          <option value="">Todos os torneios</option>
          {(torneios.data?.itens ?? []).map((torneio) => (
            <option key={torneio.id} value={torneio.id}>{torneio.nome}</option>
          ))}
        </select>
      </div>

      {partidas.isPending && <Carregando rotulo="Carregando partidas…" />}
      {partidas.isError && (
        <Erro mensagem={partidas.error instanceof Error ? partidas.error.message : 'Tente novamente.'} onTentarNovamente={() => void partidas.refetch()} />
      )}
      {partidas.data && partidas.data.itens.length === 0 && (
        <Vazio titulo="Nenhuma partida" descricao="Gere uma rodada em um torneio em andamento para ver as partidas." />
      )}
      {partidas.data && partidas.data.itens.length > 0 && (
        <Card>
          <Tabela>
            <THead>
              <TR>
                <TH>Torneio</TH><TH>Rodada</TH><TH>Brancas</TH><TH>Pretas</TH><TH>Resultado</TH><TH className="text-right">Ação</TH>
              </TR>
            </THead>
            <TBody>
              {partidas.data.itens.map((partida) => (
                <TR key={partida.id}>
                  <TD>
                    <Link href={`/dashboard/torneios/${partida.torneioId}`} className="inline-flex min-h-11 items-center hover:text-acao hover:underline">
                      {(torneios.data?.itens ?? []).find((torneio) => torneio.id === partida.torneioId)?.nome ?? 'Torneio'}
                    </Link>
                  </TD>
                  <TD>
                    <Link href={`/dashboard/torneios/${partida.torneioId}/rodadas/${numerosRodada.get(partida.rodadaId) ?? 1}`} className="inline-flex min-h-11 items-center hover:text-acao hover:underline">
                      {numerosRodada.get(partida.rodadaId) ?? '—'}
                    </Link>
                  </TD>
                  <TD>{nomes.get(partida.brancasId) ?? '—'}</TD>
                  <TD>{nomes.get(partida.pretasId) ?? '—'}</TD>
                  <TD>
                    <Badge tom={partida.resultado === 'Pendente' ? 'aviso' : 'sucesso'}>{partida.resultado}</Badge>
                  </TD>
                  <TD>
                    <FormularioResultado
                      partida={partida}
                      onSalvo={() => {
                        void queryClient.invalidateQueries({ queryKey: queryKeys.partidas.todos });
                        void queryClient.invalidateQueries({ queryKey: queryKeys.classificacao(partida.torneioId) });
                      }}
                    />
                    <Button type="button" variant="terciario" tamanho="curto" onClick={() => void excluir(partida)}>
                      Remover
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Tabela>
        </Card>
      )}
    </div>
  );
}
