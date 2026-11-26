'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { queryKeys } from '@/services/queryKeys';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Carregando, Erro, Vazio } from '@/components/ui/estados';
import { Modal, ModalConteudo, ModalGatilho } from '@/components/ui/modal';
import { Tabela, TBody, TD, TH, THead, TR } from '@/components/ui/tabela';
import { FormularioTorneio } from '@/components/torneios/FormularioTorneio';
import type { ListaDTO, TorneioDTO } from '@/types/dtos';
import type { StatusTorneio } from '@/types/dominio';

const tomStatus: Record<StatusTorneio, 'acao' | 'aviso' | 'sucesso'> = {
  'Inscrições abertas': 'acao',
  'Em andamento': 'aviso',
  Encerrado: 'sucesso',
};

export function ListaTorneios() {
  const [modalAberta, setModalAberta] = useState(false);
  const { data, isPending, isError, error, refetch } = useApiQuery<ListaDTO<TorneioDTO>>(
    queryKeys.torneios.todos,
    '/torneios',
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Modal open={modalAberta} onOpenChange={setModalAberta}>
          <ModalGatilho asChild>
            <Button type="button"><Plus size={18} aria-hidden="true" /> Novo torneio</Button>
          </ModalGatilho>
          <ModalConteudo titulo="Novo torneio" descricao="Comece com inscrições abertas.">
            <FormularioTorneio onSucesso={() => setModalAberta(false)} />
          </ModalConteudo>
        </Modal>
      </div>

      {isPending && <Carregando rotulo="Carregando torneios…" />}
      {isError && <Erro mensagem={error instanceof Error ? error.message : 'Tente novamente.'} onTentarNovamente={() => void refetch()} />}
      {data && data.itens.length === 0 && (
        <Vazio
          titulo="Nenhum torneio cadastrado"
          descricao="Crie o primeiro torneio para abrir inscrições e lançar rodadas."
          acao={{ rotulo: 'Criar torneio', onClick: () => setModalAberta(true) }}
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
                    <p className="text-xs text-estrutura/65">{torneio.local}</p>
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
