import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

/**
 * Factory for creating a PrismaClient instance.
 * - In Vercel Production: Connects to Turso Cloud (libSQL) using serverless driver adapter.
 * - In Local / Development / Testing: Uses local SQLite connection.
 */
function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  const dbUrl = process.env.DATABASE_URL || '';

  const isTurso = Boolean(
    tursoUrl ||
    dbUrl.startsWith('libsql://') ||
    (dbUrl.startsWith('https://') && !dbUrl.includes('postgres')) ||
    tursoToken
  );

  if (isTurso) {
    const url = tursoUrl || dbUrl;
    const authToken = tursoToken;
    const libsql = createClient({
      url,
      authToken
    });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
    });
  }

  // Standard SQLite / local dev connection
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });
}

export const prisma = global.prismaGlobal || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}

export default prisma;
