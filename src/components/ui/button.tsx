import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variantes = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-colors active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao disabled:pointer-events-none disabled:opacity-55',
  {
    variants: {
      variant: {
        primario: 'border border-acao bg-acao text-white hover:border-tinta hover:bg-tinta',
        secundario:
          'border border-estrutura/30 bg-papel text-tinta hover:border-estrutura/60 hover:bg-superficie/70',
        terciario: 'border border-transparent text-estrutura hover:bg-estrutura/10 hover:text-tinta',
        destrutivo: 'border border-erro bg-erro text-white hover:border-tinta hover:bg-tinta',
      },
      tamanho: {
        padrao: 'h-11 px-4',
        curto: 'h-11 min-w-11 px-3',
      },
    },
    defaultVariants: {
      variant: 'primario',
      tamanho: 'padrao',
    },
  },
);

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof variantes> & {
    asChild?: boolean;
  };

export function Button({ className, variant, tamanho, asChild = false, ...props }: ButtonProps) {
  const Componente = asChild ? Slot : 'button';
  return (
    <Componente className={cn(variantes({ variant, tamanho }), className)} {...props} />
  );
}
