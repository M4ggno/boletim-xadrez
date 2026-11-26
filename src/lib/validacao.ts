export class ErroValidacao extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroValidacao';
  }
}

interface SchemaValidavel<T> {
  validate(valor: unknown, opcoes?: { abortEarly?: boolean }): Promise<T>;
}

export async function validarPayload<T>(schema: SchemaValidavel<T>, dados: unknown): Promise<T> {
  try {
    return await schema.validate(dados, { abortEarly: false });
  } catch (erro) {
    if (erro instanceof Error) {
      throw new ErroValidacao(erro.message);
    }
    throw new ErroValidacao('Revise os dados enviados.');
  }
}

export function exigirId(valor: unknown): string {
  const id = typeof valor === 'string' ? valor : '';
  if (!/^[a-f\d]{24}$/i.test(id)) {
    throw new ErroValidacao('Identificador inválido.');
  }
  return id;
}
