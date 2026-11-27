'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { queryKeys } from '@/services/queryKeys';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { BotaoEnviar } from '@/components/ui/botao-enviar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Carregando, Erro, Vazio } from '@/components/ui/estados';
import { Tabela, TBody, TD, TH, THead, TR } from '@/components/ui/tabela';
import { Confirmacao } from '@/components/ui/confirmacao';
import { registrarResultadoAction } from '@/app/actions/partida-actions';
import { estadoInicialAcao } from '@/types/acoes';
import { RESULTADOS_PARTIDA } from '@/types/dominio';
import type { JogadorDTO, ListaDTO, PartidaDTO, TorneioDTO, RodadaDTO } from '@/types/dtos';

function FormularioResultado({ partida, onSalvo }: { partida: PartidaDTO; onSalvo: () => void }) {
  const [estado, acao] = useActionState(registrarResultadoAction, estadoInicialAcao);

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
      <Select name="resultado" defaultValue={partida.resultado}>
        <SelectTrigger className="w-32" aria-label={`Resultado da partida ${partida.id}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {RESULTADOS_PARTIDA.map((resultado) => (
            <SelectItem key={resultado} value={resultado}>{resultado}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <BotaoEnviar tamanho="curto" pendente="…">Salvar</BotaoEnviar>
    </form>
  );
}

export function ListaPartidas() {
  const queryClient = useQueryClient();
  const [filtroTorneio, setFiltroTorneio] = useState('');
  const [busca, setBusca] = useState('');
  const [termo, setTermo] = useState('');
  const [partidaParaRemover, setPartidaParaRemover] = useState<PartidaDTO | null>(null);
  const filtros = { torneioId: filtroTorneio, q: termo };
  const sufixo = `?torneioId=${filtroTorneio}&q=${encodeURIComponent(termo)}`;
  const partidas = useApiQuery<ListaDTO<PartidaDTO>>(
    queryKeys.partidas.lista(filtros),
    `/partidas${sufixo}`,
  );
  const torneios = useApiQuery<ListaDTO<TorneioDTO>>(queryKeys.torneios.todos, '/torneios');
  const jogadores = useApiQuery<ListaDTO<JogadorDTO>>(queryKeys.jogadores.todos, '/jogadores');
  const rodadas = useApiQuery<ListaDTO<RodadaDTO>>(queryKeys.rodadas.todos, '/rodadas');

  const nomes = new Map((jogadores.data?.itens ?? []).map((jogador) => [jogador.id, jogador.nome]));
  const numerosRodada = new Map((rodadas.data?.itens ?? []).map((rodada) => [rodada.id, rodada.numero]));

  async function excluir(partida: PartidaDTO) {
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          className="relative w-full sm:max-w-sm"
          onSubmit={(evento) => {
            evento.preventDefault();
            setTermo(busca.trim());
          }}
        >
          <Search size={18} className="pointer-events-none absolute left-3 top-3 text-estrutura/85" aria-hidden="true" />
          <Input
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Buscar por jogador"
            aria-label="Buscar partidas por jogador"
            className="pl-10"
          />
        </form>
        <div className="w-full sm:w-64">
          <Select
            value={filtroTorneio || 'todos'}
            onValueChange={(valor) => setFiltroTorneio(valor === 'todos' ? '' : valor)}
          >
            <SelectTrigger aria-label="Filtrar por torneio"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os torneios</SelectItem>
              {(torneios.data?.itens ?? []).map((torneio) => (
                <SelectItem key={torneio.id} value={torneio.id}>{torneio.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {partidas.isPending && <Carregando rotulo="Carregando partidas…" />}
      {partidas.isError && (
        <Erro mensagem={partidas.error instanceof Error ? partidas.error.message : 'Tente novamente.'} onTentarNovamente={() => void partidas.refetch()} />
      )}
      {partidas.data && partidas.data.itens.length === 0 && (
        <Vazio
          titulo={filtroTorneio || termo ? 'Nenhuma partida encontrada' : 'Nenhuma partida'}
          descricao={filtroTorneio || termo
            ? 'Ajuste o torneio ou o nome do jogador para ver outras partidas.'
            : 'Gere uma rodada em um torneio em andamento para ver as partidas.'}
          acao={filtroTorneio || termo
            ? {
                rotulo: 'Limpar filtros',
                onClick: () => {
                  setFiltroTorneio('');
                  setBusca('');
                  setTermo('');
                },
              }
            : undefined}
        />
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
                    <Button type="button" variant="terciario" tamanho="curto" onClick={() => setPartidaParaRemover(partida)}>
                      Remover
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Tabela>
        </Card>
      )}

      <Confirmacao
        aberto={partidaParaRemover !== null}
        onAlterar={(aberto) => { if (!aberto) setPartidaParaRemover(null); }}
        titulo="Remover partida?"
        descricao="A partida será excluída e a classificação recalculada. Esta ação não pode ser desfeita."
        rotuloConfirmar="Remover"
        onConfirmar={() => {
          if (partidaParaRemover) void excluir(partidaParaRemover);
          setPartidaParaRemover(null);
        }}
      />
    </div>
  );
}
