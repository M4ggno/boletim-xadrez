'use client';

import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

export function Campo({
  rotulo,
  erro,
  children,
}: {
  rotulo: string;
  erro?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label>{rotulo}</Label>
      {children}
      {erro && <p className="mt-1 text-sm text-erro" role="alert">{erro}</p>}
    </div>
  );
}
