'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Modal = DialogPrimitive.Root;
export const ModalGatilho = DialogPrimitive.Trigger;
export const ModalFechar = DialogPrimitive.Close;

export function ModalConteudo({
  className,
  children,
  titulo,
  descricao,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  titulo: string;
  descricao?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-estrutura/45 data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-superficie p-6 shadow-xl',
          className,
        )}
        {...props}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <DialogPrimitive.Title className="font-titulo text-xl font-semibold">{titulo}</DialogPrimitive.Title>
            {descricao && (
              <DialogPrimitive.Description className="mt-1 text-sm text-estrutura/85">
                {descricao}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            aria-label="Fechar"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md hover:bg-estrutura/5"
          >
            <X size={18} aria-hidden="true" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
