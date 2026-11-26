import mongoose, { isValidObjectId, type Model, type Types } from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { ErroValidacao } from '@/lib/validacao';

export class ErroAcesso extends Error {
  constructor(
    readonly status: 401 | 403 | 404,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = 'ErroAcesso';
  }
}

export async function exigirSessao(): Promise<string> {
  const sessao = await getServerSession(authOptions);
  if (!sessao?.user?.id) {
    throw new ErroAcesso(401, 'Faça login para continuar.');
  }
  return sessao.user.id;
}

export async function buscarDoUsuario<T extends { usuarioId: Types.ObjectId }>(
  modelo: Model<T>,
  id: string,
  usuarioId: string,
) {
  if (!isValidObjectId(id)) {
    throw new ErroAcesso(404, 'Registro não encontrado.');
  }

  const doc = await modelo.findById(id).lean();

  if (!doc) {
    throw new ErroAcesso(404, 'Registro não encontrado.');
  }

  if (String(doc.usuarioId) !== usuarioId) {
    throw new ErroAcesso(403, 'Este registro pertence a outro organizador.');
  }

  return doc;
}

export function responderErro(erro: unknown): NextResponse {
  if (erro instanceof ErroAcesso) {
    return NextResponse.json({ erro: erro.message }, { status: erro.status });
  }

  if (erro instanceof ErroValidacao) {
    return NextResponse.json({ erro: erro.message }, { status: 400 });
  }

  if (erro instanceof mongoose.Error.ValidationError) {
    const mensagens = Object.values(erro.errors).map((item) => item.message);
    return NextResponse.json({ erro: mensagens.join(' ') }, { status: 400 });
  }

  if (
    typeof erro === 'object' &&
    erro !== null &&
    'code' in erro &&
    erro.code === 11000
  ) {
    return NextResponse.json(
      { erro: 'Já existe um registro com esses dados neste torneio.' },
      { status: 400 },
    );
  }

  console.error('Erro não tratado em rota privada:', erro);
  return NextResponse.json(
    { erro: 'Não foi possível concluir a operação. Tente novamente.' },
    { status: 500 },
  );
}

export function erroParaAcao(erro: unknown): { ok: false; erro: string } {
  if (erro instanceof ErroAcesso) return { ok: false, erro: erro.message };
  if (erro instanceof ErroValidacao) {
    return { ok: false, erro: erro.message };
  }
  if (erro instanceof mongoose.Error.ValidationError) {
    return { ok: false, erro: Object.values(erro.errors).map((item) => item.message).join(' ') };
  }
  if (typeof erro === 'object' && erro !== null && 'code' in erro && erro.code === 11000) {
    return { ok: false, erro: 'Já existe um registro com esses dados.' };
  }
  console.error('Erro não tratado em Server Action:', erro);
  return { ok: false, erro: 'Não foi possível concluir. Tente novamente.' };
}
