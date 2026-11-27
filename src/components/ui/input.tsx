import * as React from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 min-h-11 w-full rounded-sm border border-estrutura/30 bg-papel px-3.5 py-2 text-base text-tinta placeholder:text-estrutura/85 transition-colors hover:border-estrutura/55 focus-visible:border-acao focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao aria-[invalid=true]:border-erro aria-[invalid=true]:bg-erro/5 disabled:cursor-not-allowed disabled:bg-superficie/60 disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}
