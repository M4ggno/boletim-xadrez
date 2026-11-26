import * as React from 'react';
import { cn } from '@/lib/utils';

export function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-11 min-h-11 w-full rounded-sm border border-estrutura/30 bg-papel px-3.5 text-base text-tinta transition-colors hover:border-estrutura/55 focus-visible:border-acao focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao aria-[invalid=true]:border-erro aria-[invalid=true]:bg-erro/5 disabled:cursor-not-allowed disabled:bg-superficie/60 disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}
