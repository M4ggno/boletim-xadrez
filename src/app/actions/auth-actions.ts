'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { registroSchema, type RegistroForm } from '@/schemas/usuario';
import type { RegistroEstado } from '@/types/acoes';

export async function registrarUsuario(
  _estadoAnterior: RegistroEstado,
  formData: FormData,
): Promise<RegistroEstado> {
  const bruto = {
    nome: formData.get('nome'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmarPassword: formData.get('confirmarPassword'),
  };

  let dados: RegistroForm;

  try {
    dados = await registroSchema.validate(bruto, { abortEarly: false });
  } catch {
    return {
      ok: false,
      erro: 'Confira os campos: nome com pelo menos 2 letras, e-mail válido e senha de 8 a 72 caracteres.',
    };
  }

  try {
    await dbConnect();

    const email = dados.email.toLowerCase();
    const jaExiste = await User.exists({ email });

    if (jaExiste) {
      return {
        ok: false,
        erro: 'Já existe uma conta com esse e-mail. Faça login ou use outro endereço.',
      };
    }

    await User.create({
      nome: dados.nome,
      email,
      password: await bcrypt.hash(dados.password, 10),
    });
  } catch {
    return { ok: false, erro: 'Não foi possível criar a conta agora. Tente novamente em instantes.' };
  }

  redirect('/login?registrado=1');
}
