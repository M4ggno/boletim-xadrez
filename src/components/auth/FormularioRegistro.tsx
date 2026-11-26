'use client';

import { useActionState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registrarUsuario } from '@/app/actions/auth-actions';
import { estadoInicialRegistro } from '@/types/acoes';
import { registroSchema, type RegistroForm } from '@/schemas/usuario';

export function FormularioRegistro() {
  const [estado, acao, pendente] = useActionState(registrarUsuario, estadoInicialRegistro);
  const [, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistroForm>({
    resolver: yupResolver(registroSchema),
    mode: 'onBlur',
  });

  const aoEnviar = handleSubmit((dados) => {
    const formData = new FormData();
    formData.set('nome', dados.nome);
    formData.set('email', dados.email);
    formData.set('password', dados.password);
    formData.set('confirmarPassword', dados.confirmarPassword);
    startTransition(() => {
      acao(formData);
    });
  });

  return (
    <form onSubmit={aoEnviar} noValidate className="mt-8 max-w-md">
      <div className="mb-5">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          autoComplete="name"
          aria-invalid={Boolean(errors.nome)}
          aria-describedby={errors.nome ? 'erro-nome' : undefined}
          {...register('nome')}
        />
        {errors.nome && (
          <p id="erro-nome" role="alert" className="mt-1 flex items-center gap-2 text-sm text-erro">
            <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" />
            {errors.nome.message}
          </p>
        )}
      </div>

      <div className="mb-5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'erro-email' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="erro-email" role="alert" className="mt-1 flex items-center gap-2 text-sm text-erro">
            <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" />
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="mb-5">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'erro-senha' : undefined}
          {...register('password')}
        />
        {errors.password && (
          <p id="erro-senha" role="alert" className="mt-1 flex items-center gap-2 text-sm text-erro">
            <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" />
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="mb-6">
        <Label htmlFor="confirmarPassword">Confirmar senha</Label>
        <Input
          id="confirmarPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmarPassword)}
          aria-describedby={errors.confirmarPassword ? 'erro-confirmar' : undefined}
          {...register('confirmarPassword')}
        />
        {errors.confirmarPassword && (
          <p
            id="erro-confirmar"
            role="alert"
            className="mt-1 flex items-center gap-2 text-sm text-erro"
          >
            <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" />
            {errors.confirmarPassword.message}
          </p>
        )}
      </div>

      {estado.erro && (
        <p role="alert" className="mb-5 flex items-start gap-2 text-sm text-erro">
          <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0" />
          {estado.erro}
        </p>
      )}

      <Button type="submit" disabled={pendente} className="w-full">
        {pendente ? 'Criando conta…' : 'Criar conta'}
      </Button>
    </form>
  );
}
