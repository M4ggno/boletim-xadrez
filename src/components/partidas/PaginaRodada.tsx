'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApiQuery } from '@/hooks/useApiQuery';
import { queryKeys } from '@/services/queryKeys';
import { BotaoEnviar } from '@/components/ui/botao-enviar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Carregando, Erro, Vazio } from '@/components/ui/estados';
import { Tabela, TBody, TD, TH, THead, TR } from '@/components/ui/tabela';
import { registrarResultadoAction } from '@/app/actions/partida-actions';
import { estadoInicialAcao } from '@/types/acoes';
import { RESULTADOS_PARTIDA } from '@/types/dominio';
import type { JogadorDTO, ListaDTO, PartidaDTO, RodadaDTO } from '@/types/dtos';

function LinhaResultado({
  partida,
  nomes,
  onSalvo,
}: {
  partida: PartidaDTO;
  nomes: Map<string, string>;
  onSalvo: () => void;
}) {
  const [estado, acao] = useActionState(registrarResultadoAction, estadoInicialAcao);

  useEffect(() => {
    if (estado.mensagem) {
      toast.success(estado.mensagem);
      onSalvo();
    }
    if (estado.erro) toast.error(estado.erro);
  }, [estado.mensagem, estado.erro, onSalvo]);

  return (
    <TR>
      <TD>{nomes.get(partida.brancasId) ?? '—'}</TD>
      <TD>{nomes.get(partida.pretasId) ?? '—'}</TD>
      <TD><Badge tom={partida.resultado === 'Pendente' ? 'aviso' : 'sucesso'}>{partida.resultado}</Badge></TD>
      <TD>
        <form action={acao} className="flex items-center justify-end gap-2">
          <input type="hidden" name="id" value={partida.id} />
          <Select name="resultado" defaultValue={partida.resultado}>
            <SelectTrigger
              className="w-28"
              aria-label={`Resultado entre ${nomes.get(partida.brancasId) ?? ''} e ${nomes.get(partida.pretasId) ?? ''}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESULTADOS_PARTIDA.map((resultado) => (
                <SelectItem key={resultado} value={resultado}>{resultado}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <BotaoEnviar tamanho="curto">Registrar</BotaoEnviar>
        </form>
      </TD>
    </TR>
  );
}

export function PaginaRodada({ torneioId, numero }: { torneioId: string; numero: number }) {
  const queryClient = useQueryClient();
  const rodadas = useApiQuery<ListaDTO<RodadaDTO>>(queryKeys.rodadas.lista(torneioId), `/rodadas?torneioId=${torneioId}`);
  const rodada = rodadas.data?.itens.find((item) => item.numero === numero);
  const partidas = useApiQuery<ListaDTO<PartidaDTO>>(
    queryKeys.partidas.lista({ rodadaId: rodada?.id ?? '' }),
    rodada ? `/partidas?rodadaId=${rodada.id}` : '/partidas?rodadaId=indisponivel',
    Boolean(rodada),
  );
  const jogadores = useApiQuery<ListaDTO<JogadorDTO>>(queryKeys.jogadores.todos, '/jogadores');
  const nomes = new Map((jogadores.data?.itens ?? []).map((jogador) => [jogador.id, jogador.nome]));

  const aoSalvar = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.partidas.todos });
    void queryClient.invalidateQueries({ queryKey: queryKeys.classificacao(torneioId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.rodadas.lista(torneioId) });
  };

  return (
    <div className="space-y-6">
      <Link href={`/dashboard/torneios/${torneioId}`} className="inline-flex min-h-11 items-center text-sm text-acao hover:underline">
        ← Voltar ao torneio
      </Link>

      {rodadas.isPending && <Carregando rotulo="Carregando rodada…" />}
      {rodadas.isError && (
        <Erro mensagem="Não foi possível carregar a rodada." onTentarNovamente={() => void rodadas.refetch()} />
      )}
      {rodadas.data && !rodada && (
        <Vazio titulo="Rodada não encontrada" descricao="Verifique o número da rodada deste torneio." />
      )}
      {rodada && (
        <>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Rodada {numero}</h2>
            <Badge tom={rodada.status === 'Encerrada' ? 'sucesso' : 'aviso'}>{rodada.status}</Badge>
          </div>
          {partidas.isPending && <Carregando />}
          {partidas.isError && (
            <Erro
              mensagem="Não foi possível carregar as partidas desta rodada."
              onTentarNovamente={() => void partidas.refetch()}
            />
          )}
          {partidas.data && partidas.data.itens.length === 0 && (
            <Vazio titulo="Sem partidas" descricao="Esta rodada ainda não tem partidas geradas." />
          )}
          {partidas.data && partidas.data.itens.length > 0 && (
            <Card>
              <Tabela>
                <THead><TR><TH>Brancas</TH><TH>Pretas</TH><TH>Resultado</TH><TH className="text-right">Registro</TH></TR></THead>
                <TBody>
                  {partidas.data.itens.map((partida) => (
                    <LinhaResultado key={partida.id} partida={partida} nomes={nomes} onSalvo={aoSalvar} />
                  ))}
                </TBody>
              </Tabela>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
