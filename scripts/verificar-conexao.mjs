import fs from 'node:fs';
import mongoose from 'mongoose';

const texto = fs.readFileSync('.env.local', 'utf8');
function valor(nome) {
  const linha = texto.split(/\r?\n/).find((item) => item.startsWith(`${nome}=`));
  if (!linha) return '';
  return linha.slice(nome.length + 1).trim().replace(/^['"]|['"]$/g, '');
}

const uri = valor('MONGODB_URI');
const tipo = uri.startsWith('mongodb+srv://') ? 'Atlas (srv)' : uri.startsWith('mongodb://') ? 'MongoDB local' : 'formato desconhecido';
console.log(`URI: ${tipo}`);
console.log(`Tamanho da URI: ${uri.length} caracteres`);

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 12000 });
  console.log('Conexão: OK');
  await mongoose.disconnect();
} catch (erro) {
  console.log(`Conexão: FALHOU (${erro?.name ?? 'erro'})`);
  console.log('Causa provável: IP não liberado no Network Access, usuário/senha errados ou URI sem o nome do banco.');
  process.exitCode = 1;
}
