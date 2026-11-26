import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email('Informe um e-mail válido.')
    .required('Informe seu e-mail.'),
  password: yup.string().required('Informe sua senha.'),
});

export const registroSchema = yup.object({
  nome: yup
    .string()
    .trim()
    .min(2, 'O nome precisa ter pelo menos 2 caracteres.')
    .max(80, 'O nome pode ter no máximo 80 caracteres.')
    .required('Informe seu nome.'),
  email: yup
    .string()
    .trim()
    .email('Informe um e-mail válido.')
    .required('Informe seu e-mail.'),
  password: yup
    .string()
    .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
    .max(72, 'A senha pode ter no máximo 72 caracteres.')
    .required('Crie uma senha.'),
  confirmarPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'As senhas não conferem.')
    .required('Confirme sua senha.'),
});

export type LoginForm = yup.InferType<typeof loginSchema>;
export type RegistroForm = yup.InferType<typeof registroSchema>;
