import mongoose from 'mongoose';

type CacheMongoose = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var cacheMongoose: CacheMongoose | undefined;
}

const cache: CacheMongoose = globalThis.cacheMongoose ?? {
  conn: null,
  promise: null,
};

if (!globalThis.cacheMongoose) {
  globalThis.cacheMongoose = cache;
}

export async function dbConnect(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(
        'MONGODB_URI não configurada. Preencha o .env.local usando o .env.example como guia.',
      );
    }
    cache.promise = mongoose.connect(uri, { bufferCommands: false });
  }

  try {
    cache.conn = await cache.promise;
  } catch (erro) {
    cache.promise = null;
    throw erro;
  }

  return cache.conn;
}
