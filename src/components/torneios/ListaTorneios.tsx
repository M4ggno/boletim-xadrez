'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { queryKeys } from '@/services/queryKeys';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Carregando, Erro, Vazio } from '@/components/ui/estados';
import { Modal, ModalConteudo, ModalGatilho } from '@/components/ui/modal';
import { Tabela, TBody, TD, TH, THead, TR } from '@/components/ui/tabela';
import { FormularioTorneio } from '@/components/torneios/FormularioTorneio';
import type { ListaDTO, TorneioDTO } from '@/types/dtos';
import { STATUS_TORNEIO, type StatusTorneio } from '@/types/dominio';

const tomStatus: Record<StatusTorneio, 'acao' | 'aviso' | 'sucesso'> = {
  'Inscrições abertas': 'acao',
  'Em andamento': 'aviso',
  Encerrado: 'sucesso',
};

export function ListaTorneios() {
  const [modalAberta, setModalAberta] = useState(false);
  const [busca, setBusca] = useState('');
  const [termo, setTermo] = useState('');
  const [status, setStatus] = useState('todos');
  const filtros = { q: termo, status };
  const sufixo = `?q=${encodeURIComponent(termo)}&status=${status === 'todos' ? '' : encodeURIComponent(status)}`;
  const { data, isPending, isError, error, refetch } = useApiQuery<ListaDTO<TorneioDTO>>(
    queryKeys.torneios.lista(filtros),
    `/torneios${sufixo}`,
  );
  const comFiltros = Boolean(termo) || status !== 'todos';

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
            placeholder="Buscar torneio"
            aria-label="Buscar torneio"
            className="pl-10"
          />
        </form>
        <div className="w-full sm:w-56">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger aria-label="Filtrar por status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {STATUS_TORNEIO.map((opcao) => (
                <SelectItem key={opcao} value={opcao}>{opcao}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:ml-auto">
          <Modal open={modalAberta} onOpenChange={setModalAberta}>
            <ModalGatilho asChild>
              <Button type="button"><Plus size={18} aria-hidden="true" /> Novo torneio</Button>
            </ModalGatilho>
            <ModalConteudo titulo="Novo torneio" descricao="Comece com inscrições abertas.">
              <FormularioTorneio onSucesso={() => setModalAberta(false)} />
            </ModalConteudo>
          </Modal>
        </div>
      </div>

      {isPending && <Carregando rotulo="Carregando torneios…" />}
      {isError && <Erro mensagem={error instanceof Error ? error.message : 'Tente novamente.'} onTentarNovamente={() => void refetch()} />}
      {data && data.itens.length === 0 && (
        <Vazio
          titulo={comFiltros ? 'Nenhum torneio encontrado' : 'Nenhum torneio cadastrado'}
          descricao={comFiltros
            ? 'Ajuste a busca ou o status para ver outros torneios.'
            : 'Crie o primeiro torneio para abrir inscrições e lançar rodadas.'}
          acao={comFiltros
            ? {
                rotulo: 'Limpar filtros',
                onClick: () => {
                  setBusca('');
                  setTermo('');
                  setStatus('todos');
                },
              }
            : { rotulo: 'Criar torneio', onClick: () => setModalAberta(true) }}
        />
      )}
      {data && data.itens.length > 0 && (
        <Card>
          <Tabela>
            <THead>
              <TR>
                <TH>Torneio</TH>
                <TH>Data</TH>
                <TH>Formato</TH>
                <TH>Rodadas</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {data.itens.map((torneio) => (
                <TR key={torneio.id}>
                  <TD>
                    <Link href={`/dashboard/torneios/${torneio.id}`} className="inline-flex min-h-11 items-center font-medium hover:text-acao hover:underline">
                      {torneio.nome}
                    </Link>
                    <p className="text-xs text-estrutura/85">{torneio.local}</p>
                  </TD>
                  <TD className="font-dados tabular-nums">{new Date(torneio.dataInicio).toLocaleDateString('pt-BR')}</TD>
                  <TD>{torneio.formato}</TD>
                  <TD className="text-right font-dados tabular-nums">{torneio.numeroRodadas}</TD>
                  <TD><Badge tom={tomStatus[torneio.status as StatusTorneio]}>{torneio.status}</Badge></TD>
                </TR>
              ))}
            </TBody>
          </Tabela>
        </Card>
      )}
    </div>
  );
}
