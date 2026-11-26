'use client';

import { useActionState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import { useInvalidarAposAcao } from '@/hooks/useInvalidarAposAcao';
import { queryKeys } from '@/services/queryKeys';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Campo } from '@/components/formularios/Campo';
import { Select } from '@/components/ui/select';
import { criarJogadorAction } from '@/app/actions/jogador-actions';
import { estadoInicialAcao } from '@/types/acoes';
import { CATEGORIAS_JOGADOR } from '@/types/dominio';
import { jogadorSchema, type JogadorForm } from '@/schemas/jogador';

export function FormularioJogador({ onSucesso }: { onSucesso?: () => void }) {
  const [estado, acao, pendente] = useActionState(criarJogadorAction, estadoInicialAcao);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const navegado = useRef(false);

  useInvalidarAposAcao(
    [estado],
    [queryKeys.jogadores.todos, queryKeys.classificacoes, queryKeys.partidas.todos],
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JogadorForm>({
    resolver: yupResolver(jogadorSchema),
    defaultValues: { nome: '', rating: 1200, categoria: 'Iniciante', clube: '', ativo: true },
  });

  useEffect(() => {
    if (estado.erro) toast.error(estado.erro);
    if (estado.ok && estado.id && !navegado.current) {
      navegado.current = true;
      toast.success(estado.mensagem ?? 'Jogador cadastrado.');
      onSucesso?.();
      router.push(`/dashboard/jogadores/${estado.id}`);
    }
  }, [estado, onSucesso, router]);

  const aoEnviar = handleSubmit((dados) => {
    const formData = new FormData();
    formData.set('nome', dados.nome);
    formData.set('rating', String(dados.rating));
    formData.set('categoria', dados.categoria);
    formData.set('clube', dados.clube ?? '');
    if (dados.ativo) formData.set('ativo', 'true');
    startTransition(() => {
      acao(formData);
    });
  });

  return (
    <form onSubmit={aoEnviar} noValidate className="grid gap-4 sm:grid-cols-2">
      <Campo rotulo="Nome" erro={errors.nome?.message}>
        <Input {...register('nome')} autoComplete="off" required />
      </Campo>
      <Campo rotulo="Rating inicial" erro={errors.rating?.message}>
        <Input {...register('rating', { valueAsNumber: true })} type="number" min={0} max={3000} required />
      </Campo>
      <Campo rotulo="Categoria" erro={errors.categoria?.message}>
        <Select {...register('categoria')}>
          {CATEGORIAS_JOGADOR.map((categoria) => (
            <option key={categoria} value={categoria}>{categoria}</option>
          ))}
        </Select>
      </Campo>
      <Campo rotulo="Clube (opcional)" erro={errors.clube?.message}>
        <Input {...register('clube')} autoComplete="off" />
      </Campo>
      <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
        <input {...register('ativo')} type="checkbox" className="h-5 w-5 accent-[#1F4E79]" />
        Jogador ativo
      </label>
      <div className="flex justify-end gap-3 sm:col-span-2">
        {onSucesso && (
          <Button type="button" variant="secundario" onClick={onSucesso}>Cancelar</Button>
        )}
        <Button type="submit" disabled={pendente}>
          {pendente ? 'Salvando…' : 'Salvar jogador'}
        </Button>
      </div>
    </form>
  );
}
