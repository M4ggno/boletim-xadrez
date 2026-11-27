'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useApiQuery } from '@/hooks/useApiQuery';
import { queryKeys } from '@/services/queryKeys';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Carregando, Erro, Vazio } from '@/components/ui/estados';
import { Modal, ModalConteudo, ModalGatilho } from '@/components/ui/modal';
import { Confirmacao } from '@/components/ui/confirmacao';
import { Tabela, TBody, TD, TH, THead, TR } from '@/components/ui/tabela';
import { FormularioJogador } from '@/components/jogadores/FormularioJogador';
import type { JogadorDTO, ListaDTO } from '@/types/dtos';

export function ListaJogadores() {
  const [busca, setBusca] = useState('');
  const [termo, setTermo] = useState('');
  const [modalAberta, setModalAberta] = useState(false);
  const [jogadorParaRemover, setJogadorParaRemover] = useState<JogadorDTO | null>(null);
  const queryClient = useQueryClient();
  const chave = queryKeys.jogadores.lista({ q: termo });
  const { data, isPending, isError, error, refetch } = useApiQuery<ListaDTO<JogadorDTO>>(
    chave,
    `/jogadores?q=${encodeURIComponent(termo)}`,
  );

  async function excluir(jogador: JogadorDTO) {
    try {
      await api.delete(`/jogadores/${jogador.id}`);
      toast.success('Jogador removido.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.jogadores.todos });
      void queryClient.invalidateQueries({ queryKey: queryKeys.classificacoes });
      void queryClient.invalidateQueries({ queryKey: queryKeys.partidas.todos });
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível remover.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            placeholder="Buscar jogador"
            aria-label="Buscar jogador"
            className="pl-10"
          />
        </form>
        <Modal open={modalAberta} onOpenChange={setModalAberta}>
          <ModalGatilho asChild>
            <Button type="button"><Plus size={18} aria-hidden="true" /> Novo jogador</Button>
          </ModalGatilho>
          <ModalConteudo titulo="Novo jogador" descricao="Os dados entram na ficha do clube.">
            <FormularioJogador onSucesso={() => setModalAberta(false)} />
          </ModalConteudo>
        </Modal>
      </div>

      {isPending && <Carregando rotulo="Carregando jogadores…" />}
      {isError && <Erro mensagem={error instanceof Error ? error.message : 'Tente novamente.'} onTentarNovamente={() => void refetch()} />}
      {data && data.itens.length === 0 && (
        <Vazio
          titulo={termo ? 'Nenhum jogador encontrado' : 'Ainda não há jogadores'}
          descricao={termo ? 'Tente outro nome.' : 'Cadastre o primeiro jogador do clube.'}
          acao={termo ? undefined : { rotulo: 'Cadastrar jogador', onClick: () => setModalAberta(true) }}
        />
      )}
      {data && data.itens.length > 0 && (
        <Card>
          <Tabela>
            <THead>
              <TR>
                <TH>Nome</TH>
                <TH>Categoria</TH>
                <TH className="text-right">Rating</TH>
                <TH>Situação</TH>
                <TH className="text-right">Ações</TH>
              </TR>
            </THead>
            <TBody>
              {data.itens.map((jogador) => (
                <TR key={jogador.id}>
                  <TD>
                    <Link href={`/dashboard/jogadores/${jogador.id}`} className="inline-flex min-h-11 items-center font-medium hover:text-acao hover:underline">
                      {jogador.nome}
                    </Link>
                    {jogador.clube && <p className="text-xs text-estrutura/85">{jogador.clube}</p>}
                  </TD>
                  <TD>{jogador.categoria}</TD>
                  <TD className="text-right font-dados tabular-nums">{jogador.rating}</TD>
                  <TD>
                    <Badge tom={jogador.ativo ? 'sucesso' : 'neutro'}>
                      {jogador.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TD>
                  <TD className="text-right">
                    <Button type="button" variant="terciario" tamanho="curto" onClick={() => setJogadorParaRemover(jogador)}>
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
        aberto={jogadorParaRemover !== null}
        onAlterar={(aberto) => { if (!aberto) setJogadorParaRemover(null); }}
        titulo="Remover jogador?"
        descricao={`${jogadorParaRemover?.nome ?? 'O jogador'} será removido da ficha do clube. Esta ação não pode ser desfeita.`}
        rotuloConfirmar="Remover"
        onConfirmar={() => {
          if (jogadorParaRemover) void excluir(jogadorParaRemover);
          setJogadorParaRemover(null);
        }}
      />
    </div>
  );
}
