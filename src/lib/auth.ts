import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { loginSchema } from '@/schemas/usuario';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const dados = await loginSchema
          .validate(credentials ?? {}, { abortEarly: false })
          .catch(() => null);

        if (!dados) return null;

        await dbConnect();

        const usuario = await User.findOne({ email: dados.email.toLowerCase() })
          .select('+password')
          .lean();

        if (!usuario?.password) return null;

        const senhaCorreta = await bcrypt.compare(dados.password, usuario.password);
        if (!senhaCorreta) return null;

        return { id: String(usuario._id), nome: usuario.nome, email: usuario.email };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nome = user.nome;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.nome = token.nome ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
