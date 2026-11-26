import type { Model, Types } from 'mongoose';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { ErroAcesso, buscarDoUsuario } from '@/lib/guards';

/** Guard de página: exige sessão e posse do registro antes de renderizar. */
export async function exigirPaginaPrivada<T extends { usuarioId: Types.ObjectId }>(
  modelo: Model<T>,
  id: string,
) {
  const sessao = await getServerSession(authOptions);
  if (!sessao?.user?.id) {
    redirect('/login');
  }

  await dbConnect();

  try {
    return await buscarDoUsuario(modelo, id, sessao.user.id);
  } catch (erro) {
    if (erro instanceof ErroAcesso) {
      notFound();
    }
    throw erro;
  }
}
