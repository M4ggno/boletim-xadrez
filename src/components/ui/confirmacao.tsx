'use client';

import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { Button } from '@/components/ui/button';

export function Confirmacao({
  aberto,
  onAlterar,
  titulo,
  descricao,
  rotuloConfirmar = 'Confirmar',
  onConfirmar,
}: {
  aberto: boolean;
  onAlterar: (aberto: boolean) => void;
  titulo: string;
  descricao: string;
  rotuloConfirmar?: string;
  onConfirmar: () => void;
}) {
  return (
    <AlertDialogPrimitive.Root open={aberto} onOpenChange={onAlterar}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-estrutura/45" />
        <AlertDialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-superficie p-6 shadow-xl">
          <AlertDialogPrimitive.Title className="font-titulo text-xl font-semibold">
            {titulo}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="mt-2 text-sm text-estrutura/80">
            {descricao}
          </AlertDialogPrimitive.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialogPrimitive.Cancel asChild>
              <Button type="button" variant="secundario">Cancelar</Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button type="button" variant="destrutivo" onClick={onConfirmar}>
                {rotuloConfirmar}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
