'use client';

import Link, { type LinkProps } from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';

type LinkButtonProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> &
  LinkProps & {
    variant?: ButtonProps['variant'];
    tamanho?: ButtonProps['tamanho'];
    className?: string;
    children: ReactNode;
  };

/**
 * Botão que navega com next/link.
 *
 * Mantém a criação do Link dentro da fronteira cliente: o Slot do Radix recebe
 * um filho cliente direto, sem desenrolar um componente lazy enviado pelo RSC.
 */
export function LinkButton({
  href,
  variant,
  tamanho,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Button asChild variant={variant} tamanho={tamanho} className={className}>
      <Link href={href} {...props}>
        {children}
      </Link>
    </Button>
  );
}
