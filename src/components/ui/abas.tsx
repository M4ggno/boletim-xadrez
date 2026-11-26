'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const Abas = TabsPrimitive.Root;

export function AbasLista({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('flex gap-1 overflow-x-auto border-b', className)}
      {...props}
    />
  );
}

export function AbaGatilho({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex min-h-11 items-center whitespace-nowrap border-b-2 border-transparent px-4 text-sm font-medium text-estrutura/70 transition-colors hover:text-estrutura data-[state=active]:border-acao data-[state=active]:text-acao',
        className,
      )}
      {...props}
    />
  );
}

export const AbaConteudo = TabsPrimitive.Content;
