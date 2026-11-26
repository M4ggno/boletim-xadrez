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
import { Select } from '@/components/ui/select';
import { Campo } from '@/components/formularios/Campo';
import { criarTorneioAction } from '@/app/actions/torneio-actions';
import { estadoInicialAcao } from '@/types/acoes';
import { FORMATOS_TORNEIO } from '@/types/dominio';
import { torneioFormSchema, type TorneioForm } from '@/schemas/torneio';

export function FormularioTorneio({ onSucesso }: { onSucesso?: () => void }) {
  const [estado, acao, pendente] = useActionState(criarTorneioAction, estadoInicialAcao);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const navegado = useRef(false);

  useInvalidarAposAcao([estado], [queryKeys.torneios.todos]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TorneioForm>({
    resolver: yupResolver(torneioFormSchema),
    defaultValues: {
      nome: '',
      local: '',
      dataInicio: new Date().toISOString().slice(0, 10),
      formato: 'Suíço',
      numeroRodadas: 3,
      status: 'Inscrições abertas',
    },
  });

  useEffect(() => {
    if (estado.erro) toast.error(estado.erro);
    if (estado.ok && estado.id && !navegado.current) {
      navegado.current = true;
      toast.success(estado.mensagem ?? 'Torneio criado.');
      onSucesso?.();
      router.push(`/dashboard/torneios/${estado.id}`);
    }
  }, [estado, onSucesso, router]);

  const aoEnviar = handleSubmit((dados) => {
    const formData = new FormData();
    formData.set('nome', dados.nome);
    formData.set('local', dados.local);
    formData.set('dataInicio', dados.dataInicio);
    formData.set('formato', dados.formato);
    formData.set('numeroRodadas', String(dados.numeroRodadas));
    formData.set('status', dados.status);
    startTransition(() => {
      acao(formData);
    });
  });

  return (
    <form onSubmit={aoEnviar} noValidate className="grid gap-4 sm:grid-cols-2">
      <Campo rotulo="Nome do torneio" erro={errors.nome?.message}>
        <Input {...register('nome')} required />
      </Campo>
      <Campo rotulo="Local" erro={errors.local?.message}>
        <Input {...register('local')} required />
      </Campo>
      <Campo rotulo="Data de início" erro={errors.dataInicio?.message}>
        <Input {...register('dataInicio')} type="date" required />
      </Campo>
      <Campo rotulo="Número de rodadas" erro={errors.numeroRodadas?.message}>
        <Input {...register('numeroRodadas', { valueAsNumber: true })} type="number" min={1} max={20} required />
      </Campo>
      <Campo rotulo="Formato" erro={errors.formato?.message}>
        <Select {...register('formato')}>
          {FORMATOS_TORNEIO.map((formato) => (
            <option key={formato} value={formato}>{formato}</option>
          ))}
        </Select>
      </Campo>
      <input type="hidden" {...register('status')} />
      <div className="flex items-end justify-end gap-3 sm:col-span-2">
        {onSucesso && <Button type="button" variant="secundario" onClick={onSucesso}>Cancelar</Button>}
        <Button type="submit" disabled={pendente}>{pendente ? 'Criando…' : 'Criar torneio'}</Button>
      </div>
    </form>
  );
}
