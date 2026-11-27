'use client';

import { create } from 'zustand';

interface EstadoUI {
  titulo: string;
  definirTitulo: (titulo: string) => void;
}

export const useUI = create<EstadoUI>((set) => ({
  titulo: 'Boletim',
  definirTitulo: (titulo) => set({ titulo }),
}));
