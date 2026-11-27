import * as React from 'react';
import { cn } from '@/lib/utils';

export function Tabela({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full border-collapse text-sm text-estrutura', className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      className={cn(
        'border-b-2 border-estrutura/25 bg-superficie/75 text-left text-xs font-semibold tracking-[0.03em] text-tinta',
        className,
      )}
      {...props}
    />
  );
}

export function TBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody className={cn('divide-y divide-estrutura/15 bg-papel', className)} {...props} />;
}

export function TR({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-superficie/50 [thead_&]:hover:bg-transparent',
        className,
      )}
      {...props}
    />
  );
}

export function TH({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      scope="col"
      className={cn('whitespace-nowrap px-4 py-3 font-semibold text-tinta', className)}
      {...props}
    />
  );
}

export function TD({ className, ...props }: React.ComponentProps<'td'>) {
  return <td className={cn('px-4 py-3.5 align-middle text-estrutura', className)} {...props} />;
}

/** Aliases no padrão ShadCN/UI; os nomes em português seguem sendo usados na aplicação. */
export const Table = Tabela;
export const TableHeader = THead;
export const TableBody = TBody;
export const TableRow = TR;
export const TableHead = TH;
export const TableCell = TD;
