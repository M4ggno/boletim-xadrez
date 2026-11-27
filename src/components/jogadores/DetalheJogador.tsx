'use client';

import { useActionState, useEffect, useTransition, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useInvalidarAposAcao } from '@/hooks/useInvalidarAposAcao';
import { queryKeys } from '@/services/queryKeys';
import { Button } from '@/components/ui/button';
import { BotaoEnviar } from '@/components/ui/botao-enviar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Campo } from '@/components/formularios/Campo';
import { ConfirmacaoExclusao } from '@/components/jogadores/ConfirmacaoExclusao';
import { Carregando, Erro } from '@/components/ui/estados';
import { atualizarJogadorAction, excluirJogadorAction } from '@/app/actions/jogador-actions';
import { estadoInicialAcao } from '@/types/acoes';
import { CATEGORIAS_JOGADOR } from '@/types/dominio';
import type { JogadorDTO } from '@/types/dtos';

export function DetalheJogador({ id }: { id: string }) {
  const router = useRouter();
  const { data, isPending, isError, error, refetch } = useApiQuery<JogadorDTO>(
    queryKeys.jogadores.detalhe(id),
    `/jogadores/${id}`,
  );
  const [estado, acao] = useActionState(atualizarJogadorAction, estadoInicialAcao);
  const [estadoExclusao, acaoExclusao, excluindo] = useActionState(excluirJogadorAction, estadoInicialAcao);
  const [, startTransition] = useTransition();
  const [confirmar, setConfirmar] = useState(false);

  useInvalidarAposAcao(
    [estado, estadoExclusao],
    [
      queryKeys.jogadores.detalhe(id),
      queryKeys.jogadores.todos,
      queryKeys.classificacoes,
      queryKeys.partidas.todos,
    ],
  );

  useEffect(() => {
    if (estado.mensagem) toast.success(estado.mensagem);
    if (estado.erro) toast.error(estado.erro);
  }, [estado]);

  useEffect(() => {
    if (estadoExclusao.mensagem) {
      toast.success(estadoExclusao.mensagem);
      router.push('/dashboard/jogadores');
    }
    if (estadoExclusao.erro) toast.error(estadoExclusao.erro);
  }, [estadoExclusao, router]);

  if (isPending) return <Carregando rotulo="Carregando ficha…" />;
  if (isError) {
    return (
      <Erro
        mensagem={error instanceof Error ? error.message : 'Tente novamente.'}
        onTentarNovamente={() => void refetch()}
      />
    );
  }
  if (!data) return null;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/jogadores" className="inline-flex min-h-11 items-center text-sm text-acao hover:underline">
        ← Voltar para jogadores
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle>Ficha de {data.nome}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={acao} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={data.id} />
              <Campo rotulo="Nome">
                <Input name="nome" defaultValue={data.nome} required />
              </Campo>
              <Campo rotulo="Rating">
                <Input name="rating" type="number" defaultValue={data.rating} min={0} max={3000} required />
              </Campo>
              <Campo rotulo="Categoria">
                <Select name="categoria" defaultValue={data.categoria}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_JOGADOR.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Campo>
              <Campo rotulo="Clube">
                <Input name="clube" defaultValue={data.clube ?? ''} />
              </Campo>
              <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  name="ativo"
                  value="true"
                  defaultChecked={data.ativo}
                  className="h-5 w-5 accent-acao"
                />
                Jogador ativo
              </label>
              <div className="sm:col-span-2">
                <BotaoEnviar>Salvar alterações</BotaoEnviar>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-estrutura/85">Situação</span>
              <Badge tom={data.ativo ? 'sucesso' : 'neutro'}>{data.ativo ? 'Ativo' : 'Inativo'}</Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-estrutura/85">Rating</span>
              <span className="font-dados tabular-nums">{data.rating}</span>
            </div>
            <div className="border-t pt-4">
              <Button type="button" variant="destrutivo" onClick={() => setConfirmar(true)}>
                Remover jogador
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmacaoExclusao
        aberto={confirmar}
        onAlterar={setConfirmar}
        titulo="Remover jogador?"
        descricao={`${data.nome} será removido da ficha do clube. Esta ação não pode ser desfeita.`}
        rotuloConfirmar="Remover"
        onConfirmar={() => {
          const formulario = new FormData();
          formulario.set('id', data.id);
          startTransition(() => {
            void acaoExclusao(formulario);
          });
          setConfirmar(false);
        }}
        pendente={excluindo}
      />
    </div>
  );
}
