'use client';

import { useActionState, useEffect, useTransition, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useInvalidarAposAcao } from '@/hooks/useInvalidarAposAcao';
import { queryKeys } from '@/services/queryKeys';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carregando, Erro, Vazio } from '@/components/ui/estados';
import { AbaConteudo, AbaGatilho, Abas, AbasLista } from '@/components/ui/abas';
import { Tabela, TBody, TD, TH, THead, TR } from '@/components/ui/tabela';
import { Select } from '@/components/ui/select';
import { FormularioTorneio } from '@/components/torneios/FormularioTorneio';
import {
  atualizarTorneioAction,
  cancelarInscricaoAction,
  encerrarTorneioAction,
  gerarRodadaAction,
  iniciarTorneioAction,
  inscreverJogadorAction,
} from '@/app/actions/torneio-actions';
import { estadoInicialAcao } from '@/types/acoes';
import type {
  ClassificacaoDTO,
  InscricaoDTO,
  JogadorDTO,
  ListaDTO,
  RodadaDTO,
  TorneioDTO,
} from '@/types/dtos';

function MensagemAcao({ estado }: { estado: { mensagem?: string; erro?: string } }) {
  useEffect(() => {
    if (estado.mensagem) toast.success(estado.mensagem);
    if (estado.erro) toast.error(estado.erro);
  }, [estado]);
  return null;
}

export function DetalheTorneio({ id }: { id: string }) {
  const [editando, setEditando] = useState(false);
  const [jogadorId, setJogadorId] = useState('');
  const [estadoInscricao, acaoInscricao, inscrevendo] = useActionState(inscreverJogadorAction, estadoInicialAcao);
  const [estadoCancelar, acaoCancelar] = useActionState(cancelarInscricaoAction, estadoInicialAcao);
  const [estadoIniciar, acaoIniciar] = useActionState(iniciarTorneioAction, estadoInicialAcao);
  const [estadoEncerrar, acaoEncerrar] = useActionState(encerrarTorneioAction, estadoInicialAcao);
  const [estadoRodada, acaoRodada] = useActionState(gerarRodadaAction, estadoInicialAcao);
  const [estadoEdicao, acaoEdicao] = useActionState(atualizarTorneioAction, estadoInicialAcao);
  const [, startTransition] = useTransition();

  const torneio = useApiQuery<TorneioDTO>(queryKeys.torneios.detalhe(id), `/torneios/${id}`);
  const jogadores = useApiQuery<ListaDTO<JogadorDTO>>(
    queryKeys.jogadores.todos,
    '/jogadores',
    torneio.data?.status === 'Inscrições abertas',
  );
  const inscricoes = useApiQuery<ListaDTO<InscricaoDTO>>(
    queryKeys.inscricoes.lista(id),
    `/inscricoes?torneioId=${id}`,
  );
  const rodadas = useApiQuery<ListaDTO<RodadaDTO>>(
    queryKeys.rodadas.lista(id),
    `/rodadas?torneioId=${id}`,
  );
  const classificacao = useApiQuery<ClassificacaoDTO[]>(
    queryKeys.classificacao(id),
    `/torneios/${id}/classificacao`,
  );

  useInvalidarAposAcao(
    [estadoInscricao, estadoCancelar, estadoIniciar, estadoEncerrar, estadoRodada, estadoEdicao],
    [
      queryKeys.torneios.detalhe(id),
      queryKeys.torneios.todos,
      queryKeys.inscricoes.lista(id),
      queryKeys.inscricoes.todos,
      queryKeys.rodadas.lista(id),
      queryKeys.rodadas.todos,
      queryKeys.partidas.todos,
      queryKeys.classificacao(id),
    ],
  );

  if (torneio.isPending) return <Carregando rotulo="Carregando torneio…" />;
  if (torneio.isError || !torneio.data) {
    return (
      <Erro
        mensagem={torneio.error instanceof Error ? torneio.error.message : 'Torneio não encontrado.'}
        onTentarNovamente={() => void torneio.refetch()}
      />
    );
  }

  const dados = torneio.data;
  const todosJogadores = (jogadores.data?.itens ?? []).filter(
    (jogador) => !(inscricoes.data?.itens ?? []).some((inscricao) => inscricao.jogadorId === jogador.id),
  );

  function formularioSimples(campos: Record<string, string>) {
    const dadosFormulario = new FormData();
    for (const [chave, valor] of Object.entries(campos)) dadosFormulario.set(chave, valor);
    return dadosFormulario;
  }

  return (
    <div className="space-y-6">
      <MensagemAcao estado={estadoInscricao} />
      <MensagemAcao estado={estadoCancelar} />
      <MensagemAcao estado={estadoIniciar} />
      <MensagemAcao estado={estadoEncerrar} />
      <MensagemAcao estado={estadoRodada} />
      <MensagemAcao estado={estadoEdicao} />

      <Link href="/dashboard/torneios" className="inline-flex min-h-11 items-center text-sm text-acao hover:underline">
        ← Voltar para torneios
      </Link>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-2xl">{dados.nome}</CardTitle>
            <p className="mt-1 text-sm text-estrutura/75">
              {dados.local} · {new Date(dados.dataInicio).toLocaleDateString('pt-BR')} · {dados.formato} · {dados.numeroRodadas} rodadas
            </p>
          </div>
          <Badge tom={dados.status === 'Encerrado' ? 'sucesso' : dados.status === 'Em andamento' ? 'aviso' : 'acao'}>
            {dados.status}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {dados.status === 'Inscrições abertas' && (
            <Button type="button" onClick={() => startTransition(() => { acaoIniciar(formularioSimples({ id })); })}>
              Iniciar torneio
            </Button>
          )}
          {dados.status === 'Em andamento' && (
            <>
              <Button type="button" onClick={() => startTransition(() => { acaoRodada(formularioSimples({ torneioId: id })); })}>
                Gerar próxima rodada
              </Button>
              <Button type="button" variant="secundario" onClick={() => startTransition(() => { acaoEncerrar(formularioSimples({ id })); })}>
                Encerrar torneio
              </Button>
            </>
          )}
          <Button type="button" variant="terciario" onClick={() => setEditando((valor) => !valor)}>
            {editando ? 'Fechar edição' : 'Editar dados'}
          </Button>
        </CardContent>
      </Card>

      {editando && (
        <Card>
          <CardHeader><CardTitle>Editar torneio</CardTitle></CardHeader>
          <CardContent>
            <form action={acaoEdicao} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={id} />
              <label className="text-sm">Nome<input name="nome" defaultValue={dados.nome} className="mt-1 h-11 w-full rounded-md border bg-transparent px-3 text-base" required /></label>
              <label className="text-sm">Local<input name="local" defaultValue={dados.local} className="mt-1 h-11 w-full rounded-md border bg-transparent px-3 text-base" required /></label>
              <label className="text-sm">Data<input name="dataInicio" type="date" defaultValue={dados.dataInicio.slice(0, 10)} className="mt-1 h-11 w-full rounded-md border bg-transparent px-3 text-base" required /></label>
              <label className="text-sm">Rodadas<input name="numeroRodadas" type="number" min={1} max={20} defaultValue={dados.numeroRodadas} className="mt-1 h-11 w-full rounded-md border bg-transparent px-3 text-base" required /></label>
              <label className="text-sm">Formato<Select name="formato" defaultValue={dados.formato}><option>Suíço</option><option>Eliminatória</option></Select></label>
              <label className="text-sm">Status<Select name="status" defaultValue={dados.status}><option>Inscrições abertas</option><option>Em andamento</option><option>Encerrado</option></Select></label>
              <div className="sm:col-span-2"><Button type="submit">Salvar alterações</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <Abas defaultValue="inscricoes">
        <AbasLista>
          <AbaGatilho value="inscricoes">Inscrições</AbaGatilho>
          <AbaGatilho value="rodadas">Rodadas</AbaGatilho>
          <AbaGatilho value="classificacao">Classificação</AbaGatilho>
        </AbasLista>

        <AbaConteudo value="inscricoes" className="pt-6">
          {dados.status === 'Inscrições abertas' && (
            <form
              action={acaoInscricao}
              className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <input type="hidden" name="torneioId" value={id} />
              <div className="w-full sm:max-w-sm">
                <Select value={jogadorId} onChange={(evento) => setJogadorId(evento.target.value)} name="jogadorId" required>
                  <option value="">Selecione um jogador</option>
                  {todosJogadores.map((jogador) => (
                    <option key={jogador.id} value={jogador.id}>{jogador.nome} · {jogador.rating}</option>
                  ))}
                </Select>
              </div>
              <Button type="submit" disabled={inscrevendo || !jogadorId}>Inscrever jogador</Button>
            </form>
          )}
          {inscricoes.isPending && <Carregando />}
          {inscricoes.data && inscricoes.data.itens.length === 0 && (
            <Vazio titulo="Sem inscrições" descricao="Inscreva ao menos dois jogadores para iniciar o torneio." />
          )}
          {inscricoes.data && inscricoes.data.itens.length > 0 && (
            <Card>
              <Tabela>
                <THead><TR><TH>Jogador</TH><TH>Data</TH><TH className="text-right">Ações</TH></TR></THead>
                <TBody>
                  {inscricoes.data.itens.map((inscricao) => (
                    <TR key={inscricao.id}>
                      <TD>{inscricao.jogadorNome ?? 'Jogador removido'}</TD>
                      <TD className="font-dados tabular-nums">{new Date(inscricao.dataInscricao).toLocaleDateString('pt-BR')}</TD>
                      <TD className="text-right">
                        {dados.status === 'Inscrições abertas' && (
                          <Button type="button" variant="terciario" tamanho="curto" onClick={() => startTransition(() => { acaoCancelar(formularioSimples({ id: inscricao.id })); })}>
                            Cancelar
                          </Button>
                        )}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Tabela>
            </Card>
          )}
        </AbaConteudo>

        <AbaConteudo value="rodadas" className="pt-6">
          {rodadas.isPending && <Carregando />}
          {rodadas.data && rodadas.data.itens.length === 0 && (
            <Vazio titulo="Sem rodadas" descricao="Inicie o torneio e gere a primeira rodada." />
          )}
          {rodadas.data && rodadas.data.itens.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {rodadas.data.itens.map((rodada) => (
                <Link key={rodada.id} href={`/dashboard/torneios/${id}/rodadas/${rodada.numero}`} className="flex min-h-11 flex-col rounded-lg border p-4 transition-colors hover:border-acao">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-titulo text-lg font-semibold">Rodada {rodada.numero}</span>
                    <Badge tom={rodada.status === 'Encerrada' ? 'sucesso' : 'aviso'}>{rodada.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-estrutura/70">Ver partidas e lançar resultados →</p>
                </Link>
              ))}
            </div>
          )}
        </AbaConteudo>

        <AbaConteudo value="classificacao" className="pt-6">
          {classificacao.isPending && <Carregando />}
          {classificacao.data && classificacao.data.length === 0 && (
            <Vazio titulo="Classificação vazia" descricao="Inscreva jogadores para compor a tabela." />
          )}
          {classificacao.data && classificacao.data.length > 0 && (
            <Card>
              <Tabela>
                <THead>
                  <TR>
                    <TH className="w-12">#</TH><TH>Jogador</TH><TH className="text-right">Pts</TH>
                    <TH className="text-right">V</TH><TH className="text-right">E</TH><TH className="text-right">D</TH>
                    <TH className="text-right">Desempate</TH>
                  </TR>
                </THead>
                <TBody>
                  {classificacao.data.map((linha, indice) => (
                    <TR key={linha.jogadorId}>
                      <TD className="font-dados tabular-nums">{indice + 1}</TD>
                      <TD className="font-medium">{linha.nome}</TD>
                      <TD className="text-right font-dados tabular-nums font-semibold">{linha.pontos}</TD>
                      <TD className="text-right font-dados tabular-nums">{linha.vitorias}</TD>
                      <TD className="text-right font-dados tabular-nums">{linha.empates}</TD>
                      <TD className="text-right font-dados tabular-nums">{linha.derrotas}</TD>
                      <TD className="text-right font-dados tabular-nums">{linha.desempate}</TD>
                    </TR>
                  ))}
                </TBody>
              </Tabela>
            </Card>
          )}
        </AbaConteudo>
      </Abas>
    </div>
  );
}
