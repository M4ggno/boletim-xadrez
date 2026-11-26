import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { AppShell } from '@/components/layout/AppShell';
import { authOptions } from '@/lib/auth';

export default async function LayoutDashboard({ children }: { children: ReactNode }) {
  const sessao = await getServerSession(authOptions);

  if (!sessao?.user?.id) {
    redirect('/login');
  }

  return <AppShell nomeUsuario={sessao.user.nome ?? sessao.user.email ?? 'Organizador'}>{children}</AppShell>;
}
