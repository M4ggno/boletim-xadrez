import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variantes = cva(
  'inline-flex min-h-7 items-center whitespace-nowrap rounded-sm border px-2.5 py-0.5 font-dados text-xs font-medium tracking-[0.01em]',
  {
    variants: {
      tom: {
        neutro: 'border-estrutura/25 bg-superficie text-tinta',
        acao: 'border-acao/30 bg-acao/10 text-acao',
        sucesso: 'border-sucesso/30 bg-sucesso/10 text-sucesso',
        aviso: 'border-aviso/30 bg-aviso/10 text-aviso',
        erro: 'border-erro/30 bg-erro/10 text-erro',
      },
    },
    defaultVariants: { tom: 'neutro' },
  },
);

type BadgeProps = React.ComponentProps<'span'> & VariantProps<typeof variantes>;

export function Badge({ className, tom, ...props }: BadgeProps) {
  return <span className={cn(variantes({ tom }), className)} {...props} />;
}
