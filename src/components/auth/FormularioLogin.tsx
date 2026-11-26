'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CircleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema, type LoginForm } from '@/schemas/usuario';

export function FormularioLogin() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  });

  const aoEnviar = handleSubmit(async (dados) => {
    setEnviando(true);

    try {
      const resultado = await signIn('credentials', {
        redirect: false,
        email: dados.email,
        password: dados.password,
      });

      if (!resultado?.ok || resultado.error) {
        toast.error('E-mail ou senha incorretos.');
        return;
      }

      toast.success('Sessão iniciada.');
      router.push('/dashboard');
      router.refresh();
    } catch {
      toast.error('Não foi possível entrar agora. Tente novamente em instantes.');
    } finally {
      setEnviando(false);
    }
  });

  return (
    <form onSubmit={aoEnviar} noValidate className="mt-8 max-w-md">
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

      <div className="mb-6">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
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

      <Button type="submit" disabled={enviando} className="w-full">
        {enviando ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  );
}
