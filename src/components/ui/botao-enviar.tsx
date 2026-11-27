'use client';

import { useFormStatus } from 'react-dom';
import { Button, type ButtonProps } from '@/components/ui/button';

/** Botão de envio que lê o estado pendente do <form> mais próximo. */
export function BotaoEnviar({
  children,
  pendente = 'Salvando…',
  disabled,
  ...props
}: ButtonProps & { pendente?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending ? pendente : children}
    </Button>
  );
}
