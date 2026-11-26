'use client';

import { create } from 'zustand';

type Tema = 'claro';

interface EstadoUI {
  titulo: string;
  modalAberta: boolean;
  acaoModal: string | null;
  definirTitulo: (titulo: string) => void;
  abrirModal: (acao: string) => void;
  fecharModal: () => void;
  definirTema: (tema: Tema) => void;
}

export const useUI = create<EstadoUI>((set) => ({
  titulo: 'Boletim',
  modalAberta: false,
  acaoModal: null,
  definirTitulo: (titulo) => set({ titulo }),
  abrirModal: (acao) => set({ modalAberta: true, acaoModal: acao }),
  fecharModal: () => set({ modalAberta: false, acaoModal: null }),
  definirTema: () => undefined,
}));
